import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./api/routes/auth.routes.js";
import userRoute from "./api/routes/user.routes.js";
import bookRoutes from "./api/routes/books.routes.js";
import orderRoutes from "./api/routes/order.routes.js";
import path from "path";
import deliveryManRoutes from "./api/routes/deliveryman.routes.js";
dotenv.config();

const app = express();
// console.log(process.env.MONGO_URL);
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// console.log(`https://api.imgbb.com/1/upload?key=${process.env.IMAGE_HOISTING}`);

app.use(express.json());
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/user", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/books", bookRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/deliveryMan", deliveryManRoutes);
app.listen(5000, () => {
  console.log("Server is running at port 5000");
});
