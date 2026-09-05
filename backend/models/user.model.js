import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
// ========================================
// USER SCHEMA
// ========================================

const userSchema = new mongoose.Schema(
    {
        // ========================================
        // USERNAME
        // ========================================

        username: {
            type: String,
            required: [true, "Username is required"],

            unique: true,
            index: true,

            trim: true,
            lowercase: true,

            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"],

            match: [
                /^[a-z0-9_]+$/,
                "Username can only contain lowercase letters, numbers, and underscores",
            ],
        },

        // ========================================
        // FULL NAME
        // ========================================

        fullName: {
            type: String,
            required: [true, "Full name is required"],

            trim: true,

            minlength: [2, "Full name must be at least 2 characters"],
            maxlength: [50, "Full name cannot exceed 50 characters"],
        },

        // ========================================
        // EMAIL
        // ========================================

        email: {
            type: String,
            required: [true, "Email is required"],

            unique: true,
            index: true,

            trim: true,
            lowercase: true,

            maxlength: [100, "Email cannot exceed 100 characters"],

            validate: {
                validator: function (value) {
                    return validator.isEmail(value);
                },
                message: "Please enter a valid email address",
            },
        },

        // ========================================
        // PASSWORD
        // ========================================

        password: {
            type: String,

            required: [true, "Password is required"],

            minlength: [8, "Password must be at least 8 characters"],
            maxlength: [72, "Password cannot exceed 72 characters"],

            // Never return password by default
            select: false,

            validate: {
                validator: function (value) {
                    return (
                        /[a-z]/.test(value) &&       // lowercase
                        /[A-Z]/.test(value) &&       // uppercase
                        /[0-9]/.test(value) &&      // number
                        /[^A-Za-z0-9]/.test(value)   // special character
                    );
                },

                message:
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            },
        },

        // ========================================
        // PROFILE IMAGE
        // ========================================

        profileImg: {
            type: String,
            default: "",

            trim: true,

            maxlength: [
                500,
                "Profile image URL cannot exceed 500 characters",
            ],

            validate: {
                validator: function (value) {
                    if (!value) return true;

                    return validator.isURL(value, {
                        protocols: ["http", "https"],
                        require_protocol: true,
                    });
                },

                message: "Profile image must be a valid URL",
            },
        },

        // ========================================
        // COVER IMAGE
        // ========================================

        coverImg: {
            type: String,
            default: "",

            trim: true,

            maxlength: [
                500,
                "Cover image URL cannot exceed 500 characters",
            ],

            validate: {
                validator: function (value) {
                    if (!value) return true;

                    return validator.isURL(value, {
                        protocols: ["http", "https"],
                        require_protocol: true,
                    });
                },

                message: "Cover image must be a valid URL",
            },
        },

        // ========================================
        // BIO
        // ========================================

        bio: {
            type: String,

            default: "",

            trim: true,

            maxlength: [
                160,
                "Bio cannot exceed 160 characters",
            ],
        },

        // ========================================
        // WEBSITE / LINK
        // ========================================

        link: {
            type: String,

            default: "",

            trim: true,

            maxlength: [
                500,
                "Link cannot exceed 500 characters",
            ],

            validate: {
                validator: function (value) {
                    if (!value) return true;

                    return validator.isURL(value, {
                        protocols: ["http", "https"],
                        require_protocol: true,
                    });
                },

                message: "Please enter a valid URL",
            },
        },

        // ========================================
        // FOLLOWERS
        // ========================================

        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // ========================================
        // FOLLOWING
        // ========================================

        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },

    // ========================================
    // SCHEMA OPTIONS
    // ========================================

    {
        timestamps: true,

        // Automatically remove fields marked select:false
        // from certain serialization scenarios
        strict: true,
    }
);

// ========================================
// PASSWORD HASHING
// ========================================
userSchema.pre("save", async function () {
    // Don't hash password if password hasn't changed
    if (!this.isModified("password")) {
        return;
    }

    // Hash password
    this.password = await bcrypt.hash(this.password, 12);
});

//=================================
// PASSWORD COMPARISON
// ========================================

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(
        candidatePassword,
        this.password
    );
};

// ========================================
// REMOVE SENSITIVE DATA
// ========================================

userSchema.methods.toJSON = function () {
    const user = this.toObject();

    delete user.password;

    return user;
};

// ========================================
// CREATE USER MODEL
// ========================================

const User = mongoose.model("User", userSchema);

export default User;
