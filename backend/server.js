import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
import authRouter from "./routers/auth.route.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectMongoDB();


app.use("/api/auth", authRouter);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
