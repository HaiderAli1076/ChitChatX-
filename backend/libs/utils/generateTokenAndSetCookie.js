import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        {
            expiresIn: "15d",
        }
    );

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 24 * 60 * 60 * 1000,
        path: "/",
    });

    return token;
};

export default generateTokenAndSetCookie;