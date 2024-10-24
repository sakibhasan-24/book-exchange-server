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
  getSystemSummary,
} from "../controller/user.controller.js";
import {
  disabledDeliveryMan,
  enableDeliveryMan,
} from "../controller/books.controller.js";
const router = express.Router();

router.put("/update/:userId", verifyToken, userUpdate);
router.get("/get-users", verifyToken, getAllUser);
router.get("/get-user/:userId", verifyToken, getUser);
router.put("/apply/:userId", verifyToken, userApply);
router.put("/accept/:userId", verifyToken, acceptedRequest);
router.put("/reject/:userId", verifyToken, rejectedRequest);
router.delete("/delete/:userId", verifyToken, userDelete);
router.get("/getDeliveryMan", getAllDeliveryMan);
router.put("/disabledDeliveryMan", verifyToken, disabledDeliveryMan);
router.put("/enableDeliveryMan", verifyToken, enableDeliveryMan);

router.get("/getSystem", verifyToken, getSystemSummary);
// router.get("/get-user/:userId", verifyToken, getUser);
export default router;
