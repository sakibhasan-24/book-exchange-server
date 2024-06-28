import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import {
  createBooks,
  getAllBooks,
  getBooksForUser,
} from "../controller/books.controller.js";

const router = express.Router();
router.post("/create-book", verifyToken, createBooks);
router.get("/get-all-books", getAllBooks);
router.get("/get-all-books/:userId", verifyToken, getBooksForUser);
export default router;
