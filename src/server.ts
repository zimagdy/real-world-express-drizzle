import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import authRoutes from './routes/authRoutes.ts'
import getUpdateRoutes from './routes/getUpdateRoutes.ts'

const app = express()

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())

// Register and Login
app.use('/api/users/', authRoutes)

// Get and Update
app.use('/api/user/', getUpdateRoutes)
export { app }
