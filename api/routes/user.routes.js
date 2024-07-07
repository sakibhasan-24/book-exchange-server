import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import {
  userUpdate,
  getAllUser,
  userDelete,
  getUser,
  userApply,
} from "../controller/user.controller.js";
const router = express.Router();

router.put("/update/:userId", verifyToken, userUpdate);
router.get("/get-users", verifyToken, getAllUser);
router.get("/get-user/:userId", verifyToken, getUser);
router.put("/apply/:userId", verifyToken, userApply);
router.delete("/delete/:userId", verifyToken, userDelete);
// router.get("/get-user/:userId", verifyToken, getUser);
export default router;
