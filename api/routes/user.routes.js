import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import {
  userUpdate,
  getAllUser,
  userDelete,
} from "../controller/user.controller.js";
const router = express.Router();

router.put("/update/:userId", verifyToken, userUpdate);
router.get("/get-users", verifyToken, getAllUser);
router.delete("/delete/:userId", verifyToken, userDelete);
// router.get("/get-user/:userId", verifyToken, getUser);
export default router;
