import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_DB_URI);
        console.log(`✅ MongoDB connected: ${connect.connection.host}`);
    } catch(err) {
        console.error("❌ MongoDB connection error:", err.message);
        throw err; // Re-throw to allow caller to handle
    }
} 