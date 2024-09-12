import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import {
  createOrders,
  createPayment,
  getOrderById,
} from "../controller/order.controller.js";

const router = express.Router();
router.post("/createOrders", verifyToken, createOrders);
router.get("/getorder/:id", verifyToken, getOrderById);
router.put("/createPayment/:id", verifyToken, createPayment);
export default router;
