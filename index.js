import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./api/routes/auth.routes.js";

dotenv.config();
const app = express();
// console.log(process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/user", authRoutes);
app.listen(5000, () => {
  console.log("Server is running at port 5000");
});
