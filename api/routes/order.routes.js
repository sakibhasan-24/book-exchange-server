import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import { createOrders } from "../controller/order.controller.js";

const router = express.Router();
router.post("/createOrders", verifyToken, createOrders);
export default router;
