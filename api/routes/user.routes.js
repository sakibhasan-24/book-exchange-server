import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import {
  userUpdate,
  getAllUser,
  userDelete,
  getUser,
  userApply,
  acceptedRequest,
  rejectedRequest,
  getAllDeliveryMan,
} from "../controller/user.controller.js";
const router = express.Router();

router.put("/update/:userId", verifyToken, userUpdate);
router.get("/get-users", verifyToken, getAllUser);
router.get("/get-user/:userId", verifyToken, getUser);
router.put("/apply/:userId", verifyToken, userApply);
router.put("/accept/:userId", verifyToken, acceptedRequest);
router.put("/reject/:userId", verifyToken, rejectedRequest);
router.delete("/delete/:userId", verifyToken, userDelete);
router.get("/getDeliveryMan", getAllDeliveryMan);

// router.get("/get-user/:userId", verifyToken, getUser);
export default router;
