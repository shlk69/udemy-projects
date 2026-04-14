import express from 'express'
import cors from 'cors'
const app = express()


//Basic config
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))

//CORS config
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders:['Content-Type','Authorization'],
}))


app.get('/', (req, res) => {
    res.send('Hey There')
})

export default app
 