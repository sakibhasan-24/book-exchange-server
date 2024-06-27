import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import { createBooks } from "../controller/books.controller.js";

const router = express.Router();
router.post("/create-book", verifyToken, createBooks);
export default router;
