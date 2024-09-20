import express from "express";
import {
  deliveryManLogin,
  deliveryManSignOut,
  getAllDeliveryman,
  getDeliveryManById,
} from "../controller/deliveryman.controller.js";
import { verifyToken } from "../../helper/verifytoken.js";

const router = express.Router();

//
router.post("/login", deliveryManLogin);
router.get("/logout", deliveryManSignOut);
router.get("/getDeliveryMan", verifyToken, getAllDeliveryman);
router.get("/getDeliveryManById/:id", verifyToken, getDeliveryManById);

export default router;
