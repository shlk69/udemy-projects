import mongoose from 'mongoose'


const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully!"); // Add this line
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};


export default connection