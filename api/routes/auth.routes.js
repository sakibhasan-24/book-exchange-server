import express from "express";
import {
  googleSignIn,
  signUpUser,
  signin,
} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/signin", signin);
router.post("/googlesignin", googleSignIn);
export default router;
