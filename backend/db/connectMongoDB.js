import mongoose from "mongoose";

// ========================================
// CONNECT TO MONGODB
// ========================================

const connectMongoDB = async () => {
    try {
        // Check MongoDB URI
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not configured");
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Connected to MongoDB");

    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        // Send error to startServer()
        throw error;
    }
};

export default connectMongoDB;
