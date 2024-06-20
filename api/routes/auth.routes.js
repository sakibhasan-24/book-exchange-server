import express from "express";
import { signUpUser, signin } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/signin", signin);
export default router;
