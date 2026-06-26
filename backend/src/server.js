import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import apiRoutes from './routes/api.routes.js'
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js'

const app = express()
const PORT = Number(process.env.PORT || 5000)

app.use(cors())
app.use(express.json())

app.use('/api', apiRoutes)

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}/api`)
})
