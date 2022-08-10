import dotenv from 'dotenv'

import { PrismaClient } from '@prisma/client'
dotenv.config()
const prisma = new PrismaClient()

export default {
  conn: prisma // para importart la conexión { conn } = require('./db.js');
}
