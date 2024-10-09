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
  getAllRentBooks,
  sendRentBookToStore,
  blockedUser,
  unBlockedUser,
  getOverDueUsers,
  getBooksByCategoryAndText,
  getLatestBooks,
} from "../controller/books.controller.js";

const router = express.Router();
router.post("/create-book", verifyToken, createBooks);
router.get("/get-all-books", getAllBooks);
router.get("/getBookBySearch", getBooksByCategoryAndText);
router.get("/latest", getLatestBooks);
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
router.get("/getAllRentBooks/:id", verifyToken, getAllRentBooks);
router.put("/sentBookToStore/:id", verifyToken, sendRentBookToStore);
router.put("/blockUser/:id", verifyToken, blockedUser);
router.put("/unBlockUser/:id", verifyToken, unBlockedUser);
router.get("/overDueUsers/:id", verifyToken, getOverDueUsers);
export default router;
