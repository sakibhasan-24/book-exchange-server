import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import { userUpdate } from "../controller/user.controller.js";
const router = express.Router();

router.put("/update/:userId", verifyToken, userUpdate);
export default router;
