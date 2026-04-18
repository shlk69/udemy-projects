import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import healthCheckRouter from './routes/healthCheck.routes.js'
import authRouter from './routes/auth.routes.js'
const app = express()


//Basic config
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))
app.use(cookieParser())

//CORS config
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders:['Caontent-Type','Authorization'],
}))

//Health check Route
app.use('/api/v1/healthcheck', healthCheckRouter)
//auth route
app.use('/api/v1/auth', authRouter)


app.get('/', (req, res) => {
    res.send('Hey There')
})

export default app
 