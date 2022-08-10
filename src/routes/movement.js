import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import userExtractor from '../middlewares/userExtractor.js'
import { transporter } from '../config/mailer.js'
const prisma = new PrismaClient()
const router = Router()

const stripeClient = Stripe(process.env.STRIPE_SECRET_KEY)

router.post('/create_payment_intent', userExtractor, async (req, res) => {
  let { amount, cvu } = req.body

  if (amount.includes(',')) {
    return res.json({ error: 'Incorrect format for the amount. Must not use ",".' }).status(406)
  }

  amount = amount.includes('.') ? amount.replace('.', '') : amount.concat('00')
  try {
    const account = await prisma.account.findUnique({
      where: {
        cvu
      },
      include: {
        users: {
          select: {
            dni: true,
            username: true,
            name: true,
            lastname: true,
            profilepic: true
          }
        }
      }
    })
    if (!account) return res.status(400).json({ msg: "The desired account for the charge, doesn't exists." })
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Number(amount),
      currency: 'ars',
      payment_method_types: ['card']
    })
    // console.log(paymentIntent)

    res.send({
      clientSecret: paymentIntent.client_secret,
      paymentIntentID: paymentIntent.id,
      account
    }).status(200)
  } catch (error) {
    console.error(error)
    res.json({ error })
  }
})

router.post('/cancel_payment_intent', userExtractor, async (req, res) => {
  const { paymentIntentID } = req.body
  const paymentIntent = await stripeClient.paymentIntents.cancel(
    paymentIntentID
  )

  res.send({
    message: `Payment status: ${paymentIntent.status}`
  }).status(200)
})

router.post('/charge', userExtractor, async (req, res) => {
  const { cvu, chargeMethod, amount: amountString } = req.body
  if (amountString.includes(',')) {
    return res.json({ error: 'Incorrect format amount.' }).status(406)
  }

  const amount = Number(amountString)

  if (!cvu || !chargeMethod || !amount) return res.status(404).json({ msg: 'Please, send all necessary information.' })
  try {
    const acc = await prisma.account.findUnique({
      where: {
        cvu
      }
    })
    console.log(acc)
    if (!acc) return res.status(400).json({ msg: "The desired account for the charge, doesn't exists." })
    const newCharge = await prisma.movement.create({
      data: {
        amount,
        chargeMethod,
        balance: acc.balance + amount,
        accounts: {
          connect: {
            cvu
          }
        },
        currencies: {
          connectOrCreate: {
            where: {
              name: 'Pesos'
            },
            create: {
              name: 'Pesos'
            }
          }
        },
        operations: {
          connectOrCreate: {
            where: {
              name: 'Charge'
            },
            create: {
              name: 'Charge'
            }
          }
        },
        categories: {
          connectOrCreate: {
            where: {
              name: 'Charge'
            },
            create: {
              name: 'Charge'
            }
          }
        }
      }
    })
    if (newCharge) {
      const updateAcc = await prisma.account.update({
        where: {
          cvu
        },
        data: {
          balance: {
            increment: amount
          }
        }
      })
      if (updateAcc) {
        const updateMov = await prisma.movement.update({
          where: {
            id: newCharge.id
          },
          data: {
            receipt: true
          }
        })
        if (updateMov) {
          return res.status(200).json({ msg: 'The charge was successful.', newCharge, updateAcc, updateMov })
        }
      }
    }
    return res.status(400).json({ msg: "Can't proceed with transaction." })
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "Can't perform this charge." })
  }
})

router.post('/make_a_movement', userExtractor, async (req, res) => {
  const { cvuMain, amount, cvuD, currency, operation, category, comment } = req.body
  console.log({ cvuMain, amount, cvuD, currency, operation, category, comment })
  const destAcc = await prisma.account.findUnique({
    where: {
      cvu: cvuD
    }
  })
  if (!destAcc) return res.status(404).send({ message: 'User not found.' })

  if (destAcc?.isDeleted) {
    return res.status(404).send({ message: 'User not found.' })
  }

  const mainAcc = await prisma.account.findUnique({
    where: {
      cvu: cvuMain
    }
  })
  const user = await prisma.user.findUnique({
    where: {
      id: mainAcc.usersIDs
    }
  })
  if (mainAcc.balance < amount) return res.status(400).json({ msg: 'Please enter a valid amount. It must not exceed your current balance.' })
  try {
    const updateMainAcc = await prisma.account.update({
      where: {
        cvu: cvuMain
      },
      data: {
        balance: {
          decrement: amount
        }
      }
    })
    const updateDestinyAcc = await prisma.account.update({
      where: {
        cvu: cvuD
      },
      data: {
        balance: {
          increment: amount
        }
      }
    })
    const newMovement = await prisma.movement.create({
      data: {
        amount,
        receipt: true,
        balance: mainAcc.balance - amount,
        destiny: cvuD,
        comment,
        accounts: {
          connect: { cvu: cvuMain }
        },
        currencies: {
          connectOrCreate: {
            where: {
              name: currency
            },
            create: {
              name: currency
            }
          }
        },
        operations: {
          connectOrCreate: {
            where: {
              name: operation
            },
            create: {
              name: operation
            }
          }
        },
        categories: {
          connectOrCreate: {
            where: {
              name: category
            },
            create: {
              name: category
            }
          }
        }
        // categories: {
        //   connect: { name: category }
        // }
      }
    })
    const newMovementDestiny = await prisma.movement.create({
      data: {
        amount,
        receipt: true,
        sentBy: cvuMain,
        balance: destAcc.balance + amount,
        accounts: {
          connect: { cvu: cvuD }
        },
        currencies: {
          connectOrCreate: {
            where: {
              name: currency
            },
            create: {
              name: currency
            }
          }
        },
        operations: {
          connectOrCreate: {
            where: {
              name: operation === 'Debit' ? 'Credit' : 'Debit'
            },
            create: {
              name: operation === 'Debit' ? 'Credit' : 'Debit'
            }
          }
        },
        categories: {
          connectOrCreate: {
            where: {
              name: category
            },
            create: {
              name: category
            }
          }
        }
      }
    })
    await transporter.sendMail({
      from: 'wallet.pfhenry@outlook.com', // sender address
      to: `${user.email}`, // list of receivers
      subject: 'Transaction successful!', // Subject line
      html: `<h1>wallet.</h1>
      <br/>
      <p> Your transaction was successful! </p>
      <p> $ ${amount} pesos, were sent to the account with CVU ${cvuD} </p>
      <br/>
      <p>Thanks for using your <strong>wallet</strong>.</p>`
    })
    res.status(200).json({ newMovement, newMovementDestiny, updateMainAcc, updateDestinyAcc })
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "Can't perform the transaction. Please, try again later." })
  }
})

router.post('/', async (req, res) => {
  const { cvu } = req.body
  try {
    const accountMovs = await prisma.account.findUnique({
      where: {
        cvu
      },
      include: {
        movements: {
          orderBy: {
            date: 'desc'
          },
          select: {
            date: true,
            amount: true,
            destiny: true,
            sentBy: true,
            currencies: true,
            categories: true,
            operations: true,
            balance: true
          }
        }
      }
    })
    res.status(200).json(accountMovs)
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: 'Could not find any transactions related to this account.' })
  }
})

router.post('/session', async (req, res) => {
  const { amount, destiny, comment, categories, id } = req.body
  try {
    const newMovInfo = await prisma.movementInfo.create({
      data: {
        amount,
        destiny,
        comment,
        categories,
        user: {
          connect: {
            id
          }
        }
      }
    })
    if (newMovInfo) res.status(200).json({ msg: 'Session saved.' })
  } catch (error) {
    console.log(error)
    res.status(404).json({ error })
  }
})

router.get('/session/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sessionInfo = await prisma.user.findUnique({
      where: {
        id
      },
      select: {
        sessionInfo: true
      }
    })
    if (sessionInfo) res.status(200).json(sessionInfo)
  } catch (error) {
    console.log(error)
    res.status(404).json(error)
  }
})

router.delete('/session/:id', async (req, res) => {
  const { id } = req.params
  try {
    const deleteSession = await prisma.movementInfo.delete({
      where: {
        userId: id
      }
    })
    if (deleteSession) {
      res.status(200).json({ msg: 'Session deleted successfully' })
    }
  } catch (error) {
    console.error(error)
  }
})
export default router
