import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import {
  assignDeliveryMan,
  assignDeliveryManProduct,
  createOrders,
  createPayment,
  deleteOrder,
  getAllOrders,
  getDeliveryManProducts,
  getOrderById,
  getOrderByUser,
  handlePaymentFailed,
  handlePaymentSuccess,
  updateOrderStatus,
} from "../controller/order.controller.js";

const router = express.Router();
router.post("/createOrders", verifyToken, createOrders);
router.get("/getorder/:id", verifyToken, getOrderById);
router.put("/createPayment/:id", verifyToken, createPayment);
router.post("/success", handlePaymentSuccess);
router.post("/failed", handlePaymentFailed);
// router.post("/success/:tran_id", getSuc);
router.get("/getOrdersByUserId/:id", verifyToken, getOrderByUser);
router.get("/getAllOrders", verifyToken, getAllOrders);
router.put("/assignDeliveryMan", verifyToken, assignDeliveryMan);
router.put("/assignDeliveryManProduct", verifyToken, assignDeliveryManProduct);
router.get("/getDeliveryManProducts/:id", verifyToken, getDeliveryManProducts);
router.put("/updateOrderStatus/:id", verifyToken, updateOrderStatus);
router.delete("/deleteOrder/:id", verifyToken, deleteOrder);
// router.post("/order/:tran_id", verifyToken, successPayment);
// router.post("/successPayment/:tran_id", successPayment);
export default router;
