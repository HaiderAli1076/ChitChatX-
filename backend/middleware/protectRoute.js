import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ========================================
// PROTECT ROUTE
// ========================================

const protectRoute = async (req, res, next) => {
    try {
        // 1. Get JWT from cookie
        const token = req.cookies.jwt;

        // 2. Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided",
            });
        }

        // 3. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 4. Check userId inside token
        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token",
            });
        }

        // 5. Find user in database
        const user = await User.findById(decoded.userId);

        // 6. Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User not found",
            });
        }

        // 7. Attach user to request
        req.user = user;

        // 8. Continue to next middleware/controller
        next();

    } catch (error) {
        console.error(
            "Protect route error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Unauthorized - Invalid or expired token",
        });
    }
};

export default protectRoute;
