import express from "express";
import {
  googleSignIn,
  signUpUser,
  signin,
  signOut,
} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/signin", signin);
router.post("/googlesignin", googleSignIn);
router.get("/signout", signOut);
export default router;
