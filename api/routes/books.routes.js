import express from "express";
import { verifyToken } from "../../helper/verifytoken.js";
import {
  createBooks,
  getAllBooks,
  getBooksForUser,
  deleteBook,
  updateBook,
  getBookById,
  getAllType,
} from "../controller/books.controller.js";

const router = express.Router();
router.post("/create-book", verifyToken, createBooks);
router.get("/get-all-books", getAllBooks);
router.get("/get-all-books/:userId", verifyToken, getBooksForUser);
router.get("/get-book/:bookId", getBookById);
router.get("/all-type", getAllType);
router.delete("/delete-book/:bookId", verifyToken, deleteBook);
router.put("/update-book/:bookId", verifyToken, updateBook);
export default router;
