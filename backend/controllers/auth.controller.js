import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../libs/utils/generateTokenAndSetCookie.js";

// ========================================
// SIGN UP
// ========================================

const signup = async (req, res) => {
    try {
        const {
            fullName,
            username,
            email,
            password,
        } = req.body;

        // Check required fields
        if (!fullName || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check that values are strings
        if (
            typeof fullName !== "string" ||
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data",
            });
        }

        // Clean / normalize input
        const cleanFullName = fullName.trim();
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        // Check empty values after trim
        if (
            !cleanFullName ||
            !cleanUsername ||
            !cleanEmail ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Fields cannot be empty",
            });
        }

        // Check username
        const existingUsername = await User.findOne({
            username: cleanUsername,
        });

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: "Username already exists",
            });
        }

        // Check email
        const existingEmail = await User.findOne({
            email: cleanEmail,
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        // Create user
        const newUser = new User({
            fullName: cleanFullName,
            username: cleanUsername,
            email: cleanEmail,
            password,
        });

        // Save user
        // Password will be hashed by the pre-save hook
        await newUser.save();

        // Generate JWT and save cookie
        generateTokenAndSetCookie(newUser._id, res);

        // Safe response
        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                fullName: newUser.fullName,
                email: newUser.email,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                bio: newUser.bio,
                link: newUser.link,
            },
        });

    } catch (error) {
        console.error("Signup error:", error);

        // Mongoose validation error
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (err) => err.message
            );

            return res.status(400).json({
                success: false,
                message: messages,
            });
        }

        // MongoDB duplicate key error
        if (error.code === 11000) {
            const duplicateField =
                Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                message: `${duplicateField} already exists`,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========================================
// LOGIN
// ========================================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Check input types
        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data",
            });
        }

        // Clean email
        const cleanEmail = email.trim().toLowerCase();

        // Find user and explicitly include password
        const user = await User.findOne({
            email: cleanEmail,
        }).select("+password");

        // Don't reveal whether email exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare entered password with hashed password
        const isPasswordCorrect =
            await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate JWT and save cookie
        generateTokenAndSetCookie(user._id, res);

        // Safe response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                profileImg: user.profileImg,
                coverImg: user.coverImg,
                bio: user.bio,
                link: user.link,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========================================
// LOGOUT
// ========================================

const logout = async (req, res) => {
    try {
        // Remove JWT cookie
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========================================
// GET CURRENT USER
// ========================================

const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                fullName: req.user.fullName,
                email: req.user.email,
                profileImg: req.user.profileImg,
                coverImg: req.user.coverImg,
                bio: req.user.bio,
                link: req.user.link,
            },
        });

    } catch (error) {
        console.error("Get me error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========================================
// EXPORT
// ========================================

export {
    signup,
    login,
    logout,
    getMe,
};
