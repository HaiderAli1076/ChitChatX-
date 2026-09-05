import User from "../models/user.model.js";



// ========================================
// SIGN UP
// ========================================

const signup = async (req, res) => {
    try {
        // ----------------------------------------
        // 1. GET DATA FROM REQUEST
        // ----------------------------------------

        const {
            fullName,
            username,
            email,
            password,
        } = req.body;

        // ----------------------------------------
        // 2. CHECK REQUIRED FIELDS
        // ----------------------------------------

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // ----------------------------------------
        // 3. CLEAN / NORMALIZE INPUT
        // ----------------------------------------

        const cleanFullName = fullName.trim();
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        // ----------------------------------------
        // 4. CHECK BASIC INPUT
        // ----------------------------------------

        if (
            cleanFullName.length === 0 ||
            cleanUsername.length === 0 ||
            cleanEmail.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Fields cannot contain only spaces",
            });
        }

        // ----------------------------------------
        // 5. CHECK USERNAME
        // ----------------------------------------

        const existingUsername = await User.findOne({
            username: cleanUsername,
        });

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: "Username already exists",
            });
        }

        // ----------------------------------------
        // 6. CHECK EMAIL
        // ----------------------------------------

        const existingEmail = await User.findOne({
            email: cleanEmail,
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        // ----------------------------------------
        // 7. CREATE USER
        // ----------------------------------------

        const newUser = new User({
            fullName: cleanFullName,
            username: cleanUsername,
            email: cleanEmail,
            password: password,
        });

        // ----------------------------------------
        // 8. SAVE USER
        // ----------------------------------------
        // The User model automatically:
        //
        // 1. Validates the data
        // 2. Hashes the password
        // 3. Saves the user in MongoDB
        //

        await newUser.save();

        // ----------------------------------------
        // 9. GENERATE JWT
        // ----------------------------------------

        generateTokenAndSetCookie(
            newUser._id,
            res
        );

        // ----------------------------------------
        // 10. SEND SAFE RESPONSE
        // ----------------------------------------
        // NEVER send password to frontend.

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
        // ----------------------------------------
        // ERROR HANDLING
        // ----------------------------------------

        console.error("Signup error:", error);

        // ----------------------------------------
        // MONGOOSE VALIDATION ERROR
        // ----------------------------------------

        if (error.name === "ValidationError") {
            const messages = Object.values(
                error.errors
            ).map((err) => err.message);

            return res.status(400).json({
                success: false,
                message: messages,
            });
        }

        // ----------------------------------------
        // MONGODB DUPLICATE KEY ERROR
        // ----------------------------------------

        if (error.code === 11000) {
            const duplicateField =
                Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                message: `${duplicateField} already exists`,
            });
        }

        // ----------------------------------------
        // UNKNOWN SERVER ERROR
        // ----------------------------------------

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========================================
// EXPORT
// ========================================



const login = (req, res) => {
    res.send("login");
}

const logout = (req, res) => {
    res.send("logout");
}

export { signup, login, logout };