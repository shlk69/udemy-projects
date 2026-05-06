import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDb } from './index.js'

const app = express()


//common middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({
    limit:'16kb'
}))
app.use(express.urlencoded({
    extended: true,
    limit:'16kb'
}))
app.use(express.static('public'))
app.use(cookieParser())

// import routes
import healthCheckRoute from './routes/healthcheck.routes.js'
import userRoutes from './routes/user.routes.js'
import { registerUser } from './controllers/user.controllers.js'

//routes
app.use('/api/v1/healthcheck', healthCheckRoute)
app.use('/api/v1/users', registerUser)



export {app}