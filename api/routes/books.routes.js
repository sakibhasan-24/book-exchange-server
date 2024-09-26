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
  confirmedBook,
  createReview,
  getReview,
  getAllReview,
} from "../controller/books.controller.js";

const router = express.Router();
router.post("/create-book", verifyToken, createBooks);
router.get("/get-all-books", getAllBooks);
router.get("/get-all-books/:userId", verifyToken, getBooksForUser);
router.get("/get-book/:bookId", getBookById);
router.get("/all-type", getAllType);
router.delete("/delete-book/:bookId", verifyToken, deleteBook);
router.put("/update-book/:bookId", verifyToken, updateBook);
router.put("/confirmedBook/:id", verifyToken, confirmedBook);
// review
router.put("/review/:id", verifyToken, createReview);
router.get("/review/:id", getReview);
router.get("/getAllreview/:bookId", getAllReview);
export default router;
