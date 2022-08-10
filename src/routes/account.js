import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const router = Router()

router.post('/', async (req, res) => {
  const { DNI, email, currency } = req.body
  try {
    const cvuPart = `${Math.floor(Math.random() * 10000000000000)}`
    const cvu = DNI + cvuPart
    const newAccount = await prisma.account.create({
      data: {
        cvu,
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
        users: {
          connect: { email }
        }
      }
    })
    console.log(newAccount)
    res.status(200).json(newAccount)
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "Can't create the account." })
  }
})

router.get('/', async (req, res) => {
  const { cvu } = req.body
  try {
    const acc = await prisma.account.findUnique({
      where: {
        cvu
      },
      include: {
        currencies: true
      }
    })
    res.status(200).json(acc)
  } catch (error) {

  }
})

export default router
