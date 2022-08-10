import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import userExtractor from '../middlewares/userExtractor.js'
const prisma = new PrismaClient()
const router = Router()

router.post('/', userExtractor, async (req, res) => {
  const id = req.userToken
  console.log(req.body)
  const { rate, comment } = req.body
  try {
    const newRating = await prisma.rating.create({
      data: {
        rate,
        comment,
        users: {
          connect: {
            id
          }
        }
      }
    })
    console.log(newRating)
    res.status(200).json(newRating)
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "Can't post the review." })
  }
})

router.get('/', async (req, res) => {
  try {
    const rate = await prisma.rating.findMany({
      select: {
        rate: true,
        comment: true,
        users: true
      }
    })
    res.status(200).json(rate)
  } catch (error) {
    console.log(error)
  }
})
export default router
