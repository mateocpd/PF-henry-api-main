import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router()

router.get('/', async (req, res) => {
  try {
    const types = await prisma.operation.findMany({})
    console.log(types)
    const result = types.map(type => type.name)
    return res.json(result)
  } catch (error) {
    console.log(error)
  }
})

router.post('/postType', async (req, res) => {
  const operation = req.body
  const data = await prisma.operation.create({
    data: {
      name: operation.name
    }
  })
  res.status(200).json(data)
})

// router.delete('/delete', async (req,res) => {
//     const {id} = req.body
//     const deleteUser = await prisma.operation.delete({
//         where: {
//           id: id,
//         },
//       })
//     return res.status(200).json(deleteUser)
// })
export default router
