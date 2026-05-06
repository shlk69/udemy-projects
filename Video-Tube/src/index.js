import { app } from "./app.js"
import dotenv from 'dotenv'
import { connection } from './db/index.js'

dotenv.config({
    path:'./.env'
})

const port = process.env.PORT || 3000
const connectDb = connection().then(() => {
    app.listen(port, () => {
        console.log(`Server is runnning on ${port}`)
    })
}).catch((err) => {
    console.log('Mongo db sync err')
})


export {connectDb}

