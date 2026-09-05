import express from "express";

import {
    signup,
    login,
    logout,
    getMe,
} from "../controllers/auth.controller.js";

import protectRoute from "../middleware/protectRoute.js";

// ========================================
// ROUTER
// ========================================

const router = express.Router();

// ========================================
// PUBLIC ROUTES
// ========================================

// Create new account
router.post("/signup", signup);

// Login user
router.post("/login", login);

// Logout user
router.post("/logout", logout);

// ========================================
// PROTECTED ROUTES
// ========================================

// Get currently logged-in user
router.get("/getme", protectRoute, getMe);

// ========================================
// EXPORT ROUTER
// ========================================

export default router;
