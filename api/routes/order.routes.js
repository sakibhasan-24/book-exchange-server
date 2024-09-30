import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import {
  assignDeliveryMan,
  assignDeliveryManProduct,
  createOrders,
  createPayment,
  getAllOrders,
  getDeliveryManProducts,
  getOrderById,
  getOrderByUser,
  updateOrderStatus,
} from "../controller/order.controller.js";

const router = express.Router();
router.post("/createOrders", verifyToken, createOrders);
router.get("/getorder/:id", verifyToken, getOrderById);
router.put("/createPayment/:id", verifyToken, createPayment);
router.get("/getOrdersByUserId/:id", verifyToken, getOrderByUser);
router.get("/getAllOrders", verifyToken, getAllOrders);
router.put("/assignDeliveryMan", verifyToken, assignDeliveryMan);
router.put("/assignDeliveryManProduct", verifyToken, assignDeliveryManProduct);
router.get("/getDeliveryManProducts/:id", verifyToken, getDeliveryManProducts);
router.put("/updateOrderStatus/:id", verifyToken, updateOrderStatus);
// router.post("/order/:tran_id", verifyToken, successPayment);
// router.post("/successPayment/:tran_id", successPayment);
export default router;
