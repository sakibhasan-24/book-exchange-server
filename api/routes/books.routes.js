import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import {
  createBooks,
  getAllBooks,
  getBooksForUser,
  deleteBook,
  updateBook,
} from "../controller/books.controller.js";

const router = express.Router();
router.post("/create-book", verifyToken, createBooks);
router.get("/get-all-books", getAllBooks);
router.get("/get-all-books/:userId", verifyToken, getBooksForUser);
router.delete("/delete-book/:bookId", verifyToken, deleteBook);
router.put("/update-book/:bookId", verifyToken, updateBook);
export default router;
