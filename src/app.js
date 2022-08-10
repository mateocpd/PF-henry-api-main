import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import fileUpload from 'express-fileupload'
import './db.js'
import './cloudinaryConfig.js'

const app = express()

app.use(express.json())
app.use(cors())

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads',
  safeFileNames: true,
  preserveExtension: true,
  preservePath: true
}))

app.use('/api', routes)

export default app
