import mongoose from 'mongoose'

const connection = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log("✅ MongoDB Connected Successfully!"); 

    } catch (error) {
        console.log('Mongo db conncetion error', error)
        process.exit(1)
    }
}


export {connection}