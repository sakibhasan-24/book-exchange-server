import Book from "../model/books.model.js";
import SSLCommerzPayment from "sslcommerz-lts";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import User from "../model/user.model.js";
const store_id = process.env.STORE_ID;
const store_password = process.env.STORE_PASS;
const isLive = false;
export const createBooks = async (req, res) => {
  if (req.user.isAdmin) {
    // can't create a book
    return res.status(403).json({
      message: "You are not allowed to create a book",
      success: false,
      error: error,
    });
  }
  try {
    const book = await Book.create(req.body);
    return res.status(201).json({
      message: "Book created successfully",
      success: true,
      book: book,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error,
    });
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    return res.status(200).json({
      message: "Books fetched successfully",
      success: true,
      books: books,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error,
    });
  }
};

export const getBooksForUser = async (req, res) => {
  if (req.user.id === req.params.userId) {
    try {
      const books = await Book.find({ bookOwner: req.params.userId });
      return res.status(200).json({
        message: "Books fetched successfully",
        success: true,
        books: books,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        success: false,
        error: error,
      });
    }
  } else {
    return res.status(403).json({
      message: "You are not allowed to get books for this user",
      success: false,
      error: error,
    });
  }
};

export const deleteBook = async (req, res) => {
  const existingBook = await Book.findById(req.params.bookId);
  if (!existingBook) {
    return res.status(404).json({
      message: "Book not found",
      success: false,
      error: error,
    });
  }
  if (existingBook.bookOwner.toString() !== req.user.id && !req.user.isAdmin) {
    console.log(existingBook.bookOwner.toString() === req.user.id);
    return res.status(403).json({
      message: "You are not allowed to delete this book",
      success: false,
    });
  }
  try {
    await Book.findByIdAndDelete(req.params.bookId);
    return res.status(200).json({
      message: "Book deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error,
    });
  }
};

export const updateBook = async (req, res) => {
  const existingBook = await Book.findById(req.params.bookId);

  if (!existingBook) {
    return res.status(404).json({
      message: "Book not found",
      success: false,
    });
  }
  if (existingBook.bookOwner.toString() !== req.user.id) {
    return res.status(403).json({
      message: "You are not allowed to update this book",
      success: false,
    });
  }
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.bookId,
      req.body,
      {
        new: true,
      }
    );
    return res.status(200).json({
      message: "Book updated successfully",
      success: true,
      book: updatedBook,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error,
    });
  }
};

export const getBookById = async (req, res) => {
  const existingBook = await Book.findById(req.params.bookId);
  // console.log(existingBook);
  if (!existingBook) {
    return res.status(404).json({
      message: "Book not found",
      success: false,
    });
  }
  try {
    return res.status(200).json({
      message: "Book fetched successfully",
      success: true,
      book: existingBook,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error,
    });
  }
};

export const getAllType = async (req, res) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sort = req.query.order === "asc" ? 1 : -1;
    const books = await Book.find({
      ...(req.query.category && {
        category: req.query.category,
      }),
      ...(req.query.title && {
        title: req.query.title,
      }),
      ...(req.query.userId && {
        userId: req.query.userId,
      }),
      ...(req.query.bookId && { _id: req.query.bookId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { address: { $regex: req.query.searchTerm, $options: "i" } },
          { category: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sort })
      .skip(startIndex)
      .limit(limit);
    const totalBook = await Book.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthBook = await Book.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      books,
      totalBook,
      lastMonthBook,
    });
  } catch (error) {
    res.status(401).json({ message: "something went wrong", success: false });
  }
};

export const confirmedBook = async (req, res) => {
  // console.log("de", req.body.data);
  if (!req.user.isAdmin) {
    return res
      .status(401)
      .json({ message: "you are not admin", success: false });
  }
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "book not found", success: false });
  }
  const tran_id = uuidv4();

  // console.log(data);
  const user = await User.findById(book.bookOwner);
  const profit = Number(user?.totalEarnings) + Number(req.body.data);

  // console.log(user);
  const data = {
    total_amount: req.body.data,
    currency: "BDT",
    tran_id,
    success_url: `http://localhost:5173`, // Redirect here on success
    fail_url: `http://localhost:5173`, // Redirect here on failure
    cancel_url: `http://localhost:5173`, // Optional: handle cancellation
    ipn_url: "http://localhost:3030/ipn",
    shipping_method: "Courier",
    product_name: "something",
    product_category: "something",
    product_profile: "something",
    cus_name: req.user.id,
    cus_email: req.user.id,
    cus_address: req.user.id,
    cus_country: "Bangladesh",
    cus_phone: req.user.id,
    // Add the missing field
    ship_name: "something", // Shipping name
    ship_add1: " something",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };
  const sslcz = new SSLCommerzPayment(store_id, store_password, isLive);
  // console.log(sslcz);
  const apiResponse = await sslcz.init(data);
  // console.log(apiResponse);
  let GatewayPageURL = apiResponse.GatewayPageURL;
  res.json(GatewayPageURL);
  if (apiResponse.status === "SUCCESS") {
    await Book.updateOne(
      { _id: req.params.id },
      {
        $set: {
          isAccepted: true,
        },
      }
    );
    await User.updateOne(
      { _id: book.bookOwner },
      {
        $set: {
          totalEarnings: profit,
        },
      }
    );
  }
};

export const createReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  console.log(req.body);
  const userId = req.user.id;
  try {
    const book = await Book.findById(id);

    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found", success: false });
    }

    if (book.bookOwner.toString() === userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can't review your own book", success: false });
    }

    const alreadyReviewed = book.bookReviews.find(
      (review) => review.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      await Book.updateOne(
        { _id: id, "bookReviews.user": userId },
        {
          $set: {
            "bookReviews.$.rating": rating,
            "bookReviews.$.comment": comment,
          },
        }
      );
      const totalReviews = book.bookReviews.length;
      const averageRating =
        book.bookReviews.reduce((acc, item) => item.rating + acc, 0) /
        totalReviews;
      const finalAverageRating = averageRating.toFixed(2);
      return res.status(200).json({
        message: "Review updated",
        success: true,
        totalReviews: totalReviews,
        finalAverageRating: finalAverageRating,
      });
    } else {
      const newReview = {
        user: userId,
        rating: Number(rating),
        comment: comment,
      };

      book.bookReviews.push(newReview);

      await book.save();

      return res.status(201).json({
        message: "Review added",
        success: true,
        totalReviews: totalReviews,
        finalAverageRating: finalAverageRating,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getReview = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found", success: false });
    }
    const totalReviews = book.bookReviews.length;
    const averageRating =
      totalReviews > 0
        ? book.bookReviews.reduce((acc, item) => item.rating + acc, 0) /
          totalReviews
        : 0;
    const finalAverageRating =
      Number(averageRating) > 0 ? Number(averageRating.toFixed(2)) : 0;
    return res.status(200).json({
      message: "Reviews retrieved",
      success: true,
      totalReviews: totalReviews,
      finalAverageRating: finalAverageRating,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Server error", success: false });
  }
};

export const getAllReview = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId).populate({
      path: "bookReviews",
      populate: {
        path: "user",
        select: "userName",
        select: "image",
      },
    });
    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found", success: false });
    }

    return res.status(200).json({
      message: "Reviews retrieved",
      success: true,
      reviews: book.bookReviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Server error", success: false });
  }
};
