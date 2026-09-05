import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectMongoDB from "./db/connectMongoDB.js";
import authRouter from "./routers/auth.route.js";

// ========================================
// ENVIRONMENT VARIABLES
// ========================================

dotenv.config();

// ========================================
// APP CONFIGURATION
// ========================================

const PORT = process.env.PORT || 5000;

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

// Parse JSON request body
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Read cookies from request
app.use(cookieParser());

// ========================================
// ROUTES
// ========================================

app.use("/api/auth", authRouter);

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectMongoDB();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
