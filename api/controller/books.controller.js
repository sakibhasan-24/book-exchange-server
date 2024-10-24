import Book from "../model/books.model.js";
import SSLCommerzPayment from "sslcommerz-lts";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import User from "../model/user.model.js";
import Order from "../model/order.model.js";
import calculatedAvgRating from "../../helper/calculateRatings.js";
const store_id = process.env.STORE_ID;
const store_password = process.env.STORE_PASS;
const isLive = false;
const clientURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://book-management-57c93.web.app";

const serverURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://book-exchange-server.vercel.app";
export const createBooks = async (req, res) => {
  if (req.user.isAdmin) {
    // can't create a book
    return res.status(403).json({
      message: "You are not allowed to create a book",
      success: false,
      error: error,
    });
  }
  const user = await User.findById({ _id: req.user.id });
  if (user.isRedAlert) {
    return res.status(403).json({
      message: "You are blocked",
      success: false,
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
  // console.log("NODE_ENV:", process.env.NODE_ENV);
  try {
    const books = await Book.find({});
    const notAcceptedBooks = await Book.find({ isAccepted: true });
    const soldBooks = await Book.find({
      bookStatus: "sell",
    });
    const calculateAvgRating = (reviews) => {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      return reviews.length > 0 ? totalRating / reviews.length : 0;
    };

    // top rated books
    const topRatedBooks = books
      .map((book) => {
        const averageRating = calculateAvgRating(book.bookReviews);
        return {
          ...book._doc,
          averageRating,
        };
      })
      .filter((book) => book.averageRating >= 3)
      .sort((a, b) => b.averageRating - a.averageRating);
    return res.status(200).json({
      message: "Books fetched successfully",
      success: true,
      books: books,
      notAcceptedBooks: notAcceptedBooks,
      soldBooks: soldBooks,
      topRatedBooks: topRatedBooks,
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
  const user = await User.findById({ _id: req.user.id });
  if (user.isRedAlert) {
    return res.status(403).json({
      message: "You are not allowed to delete this book",
      success: false,
    });
  }
  if (existingBook?.isAccepted) {
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
  if (existingBook?.isAccepted && req.user.isAdmin === false) {
    return res.status(403).json({
      message: "You are not allowed to update this book",
      success: false,
    });
  }
  if (
    existingBook.bookOwner.toString() !== req.user.id &&
    req.user.isAdmin === false
  ) {
    return res.status(403).json({
      message: "You are not allowed to update this book",
      success: false,
    });
  }
  if (req.user.isAdmin && existingBook?.isAccepted) {
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
  }
  if (!existingBook?.isAccepted && !req.user.isAdmin) {
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
    const limit = parseInt(req.query.limit) || 3;
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
      .skip(startIndex * limit)
      .limit(limit);
    const totalBook = await Book.countDocuments();

    // console.log("tot", totalBook);
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
// api for searcch

export const getBooksByCategoryAndText = async (req, res) => {
  try {
    const { category, searchTerm } = req.query;
    console.log(req.query);
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 10;

    // Create search criteria
    const searchCriteria = {
      ...(category && { category }),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          // { address: { $regex: searchText, $options: "i" } },
          // { description: { $regex: searchText, $options: "i" } },
        ],
      }),
    };
    const books = await Book.find(searchCriteria)
      .skip(startIndex * limit)
      .limit(limit);
    const totalBooks = await Book.countDocuments(searchCriteria);
    res.status(200).json({
      books,
      totalBooks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
};

export const getLatestBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json({ message: "Latest Books", success: true, books });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", success: false });
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
  const adminUser = await User.findById(req.user.id);
  const profit = Number(user?.totalEarnings) + Number(req.body.data);
  const expense = Number(adminUser?.expense) + Number(req.body.data);

  // console.log(user);
  const data = {
    total_amount: req.body.data,
    currency: "BDT",
    tran_id,
    success_url: `${serverURL}/api/books/success?book_id=${book._id}&profit=${profit}&expense=${expense}&amount=${req.body.data}`,
    fail_url: `${serverURL}/api/books/failed?book_id=${book._id}`,
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
  // console.log(data?.success_url);
  const apiResponse = await sslcz.init(data);
  console.log(apiResponse);
  let GatewayPageURL = apiResponse.GatewayPageURL;
  // console.log(GatewayPageURL);
  res.json(GatewayPageURL);
  // if (apiResponse.status === "SUCCESS") {
  //   await Book.updateOne(
  //     { _id: req.params.id },
  //     {
  //       $set: {
  //         isAccepted: true,
  //       },
  //     }
  //   );
  //   await User.updateOne(
  //     { _id: book.bookOwner },
  //     {
  //       $set: {
  //         totalEarnings: profit,
  //       },
  //     }
  //   );
  //   await User.updateOne(
  //     {
  //       _id: req.user.id,
  //     },
  //     {
  //       $set: {
  //         expense,
  //       },
  //     }
  //   );
  // }
};
export const handleAdminSuccessPayment = async (req, res) => {
  const book_id = req.query.book_id;
  const profit = Number(req.query.profit);
  const expense = Number(req.query.expense);
  const amount = Number(req.query.amount);
  // const adminTotalEarnings=await
  // console.log(profit, expense, amount);

  const book = await Book.findById(book_id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const user = await User.findById(book.bookOwner);
  const adminUser = await User.findById(req.user.id);

  console.log(user, adminUser, profit, expense);

  // Update book status to accepted
  await Book.updateOne(
    { _id: book_id }, // Use book_id instead of req.params.id
    {
      $set: {
        isAccepted: true,
      },
    }
  );

  // Update the user's total earnings
  await User.updateOne(
    { _id: book.bookOwner },
    {
      $set: {
        totalEarnings: profit,
      },
    }
  );

  // Update the admin user's expense
  await User.updateOne(
    { _id: req.user.id },
    {
      $set: {
        expense,
      },
    }
  );

  console.log(book);

  // Redirect to the book details page after updates
  return res.redirect(`${clientURL}/book/${book._id}`);
};

export const handleAdminFailedPayment = async (req, res) => {
  return res.redirect(`${clientURL}/book/${req.query.book_id}}`);
};

// export const createReview = async (req, res) => {
//   const { id } = req.params;
//   const { rating, comment } = req.body;
//   console.log("s", req.body);
//   const userId = req.user.id;
//   const validUser = await User.findById(userId);
//   // console.log(validUser);
//   if (!validUser) {
//     return res.status(404).json({ message: "User not found" });
//   }
//   if (validUser.isRedAlert) {
//     console.log("blocked User");
//     return res.status(404).json({ message: "You are blocked", success: false });
//   }
//   try {
//     const book = await Book.findById(id);

//     if (!book) {
//       return res
//         .status(404)
//         .json({ message: "Book not found", success: false });
//     }

//     if (book.bookOwner.toString() === userId.toString()) {
//       return res
//         .status(403)
//         .json({ message: "You can't review your own book", success: false });
//     }

//     const alreadyReviewed = book.bookReviews.find(
//       (review) => review.user.toString() === userId.toString()
//     );

//     if (alreadyReviewed) {
//       await Book.updateOne(
//         { _id: id, "bookReviews.user": userId },
//         {
//           $set: {
//             "bookReviews.$.rating": rating,
//             "bookReviews.$.comment": comment,
//           },
//         }
//       );
//       const totalReviews = book.bookReviews.length;
//       const averageRating =
//         book.bookReviews.reduce((acc, item) => item.rating + acc, 0) /
//         totalReviews;
//       const finalAverageRating = averageRating.toFixed(2);
//       return res.status(200).json({
//         message: "Review updated",
//         success: true,
//         totalReviews: totalReviews,
//         finalAverageRating: finalAverageRating,
//       });
//     } else {
//       const newReview = {
//         user: userId,
//         rating: Number(rating),
//         comment: comment,
//       };

//       book.bookReviews.push(newReview);

//       await book.save();

//       return res.status(201).json({
//         message: "Review added",
//         success: true,
//         totalReviews: totalReviews,
//         finalAverageRating: finalAverageRating,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server error", success: false });
//   }
// };
export const createReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  const validUser = await User.findById(userId);
  if (!validUser) {
    return res.status(404).json({ message: "User not found" });
  }
  if (validUser.isRedAlert) {
    return res.status(404).json({ message: "You are blocked", success: false });
  }

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
      const totalReviews = book.bookReviews.length;
      const averageRating =
        book.bookReviews.reduce((acc, item) => item.rating + acc, 0) /
        totalReviews;
      const finalAverageRating = averageRating.toFixed(2);

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
        select: "userName image",
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

// get rent books
// export const getAllRentBooks = async (req, res) => {
//   const { id } = req.params;
//   const user = await User.findById({ _id: id });
//   if (!user) {
//     return res.status(404).json({ message: "User not found", success: false });
//   }

//   try {
//     if (user?.isAdmin) {
//       // Use .lean() to get plain JavaScript objects
//       const os = await Order.find({})
//         .populate("user", "userName userEmail") // Populate the user field if needed
//         .populate({
//           path: "orderItems.bookOwner", // Populate the bookOwner field in orderItems
//           select: "userName", // Select only the userName field
//         });

//       console.log("Orders with populated bookOwner:", os);

//       // Extract bookOwner information from orderItems
//       const bookOwners = os.flatMap(
//         (order) => order.orderItems.map((item) => item.bookOwner) // Access bookOwner for each orderItem
//       );

//       // Now bookOwners will contain an array of bookOwner objects
//       console.log("Book Owners:", bookOwners);

//       // cbsbcbs
//       const books = await Order.find({})
//         .populate("user", "userName userEmail  isRedAlert image ")
//         .populate("orderItems.bookOwner", "userName userEmail")
//         .lean();
//       console.log("book", books);
//       if (!books || books.length === 0) {
//         return res
//           .status(404)
//           .json({ message: "No books found", success: false });
//       }

//       const rentBooks = books.flatMap((book) =>
//         book.orderItems
//           .filter((item) => item.orderType === "rent")
//           .map((item) => ({
//             ...item,
//             user: book.user,
//             bookCreator: item.bookOwner.userName,
//           }))
//       );
//       const modifyReturnedDate = await Order.find({
//         isPaid: true,
//         deliveryStatus: "Delivered",
//       });

//       // console.log("ren", rentBooks);
//       if (!rentBooks || rentBooks.length === 0) {
//         return res
//           .status(404)
//           .json({ message: "No rent books found", success: false });
//       }

//       return res.status(200).json({
//         message: "All rent books",
//         success: true,
//         rentBooks,
//         modifyReturnedDate,
//       });
//     }

//     // For regular users
//     const order = await Order.find({ user: id })
//       .populate("user", "userName userEmail isRedAlert image")
//       .lean();
//     // console.log("s", order);
//     const modifyReturnedDate = await Order.find({
//       isPaid: true,
//       deliveryStatus: "Delivered",
//     });

//     console.log("m", modifyReturnedDate);

//     if (!order || order.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No order found", success: false });
//     }

//     const rentBooks = order.flatMap((book) =>
//       book.orderItems
//         .filter((item) => item.orderType === "rent")
//         .map((item) => ({
//           ...item,
//           user: book.user, // Attach user data to the book item
//           bookCreator: item.bookOwner.userName,
//         }))
//     );

//     console.log("ree", rentBooks);
//     if (!rentBooks || rentBooks.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No rent books found", success: false });
//     }

//     return res.status(200).json({
//       message: "All rent books",
//       success: true,
//       rentBooks,
//       modifyReturnedDate,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message, success: false });
//   }
// };
export const getAllRentBooks = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id });
  if (!user) {
    return res.status(404).json({ message: "User not found", success: false });
  }

  try {
    if (user?.isAdmin) {
      const books = await Order.find({})
        .populate("user", "userName userEmail isRedAlert image")
        .populate({
          path: "orderItems.bookOwner",
          select: "userName userEmail",
        })
        .lean();

      const rentBooks = books.flatMap((book) =>
        book.orderItems
          .filter((item) => item.orderType === "rent")
          .map((item) => ({
            ...item,
            user: book.user,
            bookOwner: item.bookOwner, // Include the populated bookOwner
          }))
      );

      if (!rentBooks || rentBooks.length === 0) {
        return res
          .status(404)
          .json({ message: "No rent books found", success: false });
      }

      // console.log("reeee", rentBooks.length);
      return res.status(200).json({
        message: "All rent books",
        success: true,
        rentBooks,
      });
    }

    // For regular users
    const order = await Order.find({ user: id })
      .populate("user", "userName userEmail isRedAlert image")
      .populate({
        path: "orderItems.bookOwner",
        select: "userName userEmail",
      })
      .lean();

    const rentBooks = order.flatMap((book) =>
      book.orderItems
        .filter((item) => item.orderType === "rent")
        .map((item) => ({
          ...item,
          user: book.user,
          bookOwner: item.bookOwner,
        }))
    );

    if (!rentBooks || rentBooks.length === 0) {
      return res
        .status(404)
        .json({ message: "No rent books found", success: false });
    }

    return res.status(200).json({
      message: "All rent books",
      success: true,
      rentBooks,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const sendRentBookToStore = async (req, res) => {
  const { id } = req.params;
  // console.log("param");
  const { user } = req.body;
  // console.log("body", req.body);
  const userInfo = await User.findById({ _id: user });

  const bookFromId = await Book.findById({ _id: id });

  console.log("books", bookFromId);
  if (bookFromId.bookStatus === "available") {
    console.log("Book is Available");
    return res
      .status(400)
      .json({ message: "Book is available", success: false });
  }
  if (bookFromId.bookStatus === "rent") {
    console.log("Book is Rented");
    // console.log(bookFromId);
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { bookStatus: "available" },
      { new: true }
    );

    const order = await Order.find({ user }).lean();
    // console.log("s", order);
    const rentBooks = order
      .flatMap((order) => order.orderItems)
      .find(
        (item) =>
          item.orderType === "rent" &&
          item.product.toString() === bookFromId._id.toString()
      );

    console.log("all order for user", rentBooks);

    if (rentBooks?.isBack === false) {
      // console.log(rentBooks);

      // Find the order that contains the specific order item
      const order = await Order.findOne({
        "orderItems._id": rentBooks._id, // Match the order item by its ID
      });

      console.log(order);
      if (!order) {
        return res
          .status(404)
          .json({ message: "Order not found", success: false });
      }

      // Update the isBack field for the specific order item
      const updatedOrder = await Order.updateOne(
        { "orderItems._id": rentBooks._id }, // Match the specific order item
        { $set: { "orderItems.$.isBack": true } } // Update isBack to true
      );

      // console.log("Order updated:", updatedOrder);

      return res
        .status(200)
        .json({ message: "Book return updated", success: true });
    }

    return res
      .status(200)
      .json({ message: "Book is available", success: true });
  }
};

export const blockedUser = async (req, res) => {
  if (req.user.isAdmin === false) {
    return res.status(401).json({
      message: "You are not authorized to perform this action",
      success: false,
    });
  }

  const { id } = req.params;
  console.log("sss", id);
  const orders = await Order.find({ user: id }).lean();
  // console.log("s", orders);
  if (!orders) {
    return res.status(404).json({ message: "Order not found", success: false });
  }
  const allOrderItems = orders.flatMap((order) => order.orderItems);

  // console.log("All order items for the user:", allOrderItems);
  const isValidForBlock = allOrderItems.filter(
    (orderItem) => orderItem.isBack === false
  );
  //    console  . log   ("isValidForBlock", isValidForBlock);
  if (isValidForBlock.length > 0) {
    const today = new Date();

    const remainingDays = isValidForBlock.map((orderItem) => {
      const returnDate = new Date(orderItem.returnDate);
      const timeDifference = returnDate - today;
      const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
      return daysRemaining;
    });
    const blockBasedOnDays = remainingDays.map((d) => (d < 0 ? true : false));
    console.log(blockBasedOnDays);
    if (blockBasedOnDays.includes(true)) {
      const blockUser = await User.updateOne({ _id: id }, { isRedAlert: true });
      return res
        .status(200)
        .json({ message: "User blocked", success: true, blockUser });
    }
  }

  // console.log();
};

export const unBlockedUser = async (req, res) => {
  if (req.user.isAdmin === false) {
    return res.status(401).json({
      message: "You are not authorized to perform this action",
      success: false,
    });
  }

  const { id } = req.params;
  console.log("block", id);
  // const orders = await Order.find({ user: id }).lean();
  // // console.log("s", orders);
  // if (!orders) {
  //   return res.status(404).json({ message: "Order not found", success: false });
  // }
  // const allOrderItems = orders.flatMap((order) => order.orderItems);

  // // console.log("All order items for the user:", allOrderItems);
  // const isValidForUnBlock = allOrderItems.filter(
  //   (orderItem) => orderItem.isBack === true
  // );
  // console.log("isValidUnForBlock", isValidForUnBlock);
  // if (isValidForUnBlock.length === 0) {
  // }
  const user = await User.findById({ _id: req.params.id });
  if (user.isRedAlert === true) {
    user.isRedAlert = false;
    user.save();
    return res.status(200).json({
      message: "User is unblocked",
      success: true,
    });
  }

  // console.log();
};

export const disabledDeliveryMan = async (req, res) => {
  if (req.user.isAdmin !== true) {
    return res.status(401).json({
      message: "You are not authorized to perform this action",
      success: false,
    });
  }
  const { id } = req.body;
  console.log(id);
  const user = await User.findById({ _id: id });
  console.log(user);
  if (user.assignedOrders.length !== 0) {
    return res.status(404).json({
      message: "Currently this action will not take",
      success: false,
    });
  }
  if (user.role === "deliveryMan") {
    user.isRedAlert = true;
    await user.save();
    return res.status(200).json({
      message: "Delivery Man is disabled",
      success: true,
    });
  }
};
export const enableDeliveryMan = async (req, res) => {
  if (req.user.isAdmin !== true) {
    return res.status(401).json({
      message: "You are not authorized to perform this action",
      success: false,
    });
  }
  const { id } = req.body;
  const user = await User.findById({ _id: id });
  if (user.role === "deliveryMan") {
    user.isRedAlert = false;
    await user.save();
    return res.status(200).json({
      message: "Delivery Man is enabled",
      success: true,
    });
  }
};

export const getOverDueUsers = async (req, res) => {
  if (req.user.isAdmin !== true) {
    return res.status(401).json({
      message: "You are not authorized to perform this action",
      success: false,
    });
  }

  // Get all users with the "user" role
  const users = await User.find({ role: "user" }).lean();
  const userIds = users.map((user) => user._id);

  // Find all orders for these users
  const orders = await Order.find({ user: { $in: userIds } })
    .populate("user", "userEmail userName isRedAlert _id")
    .lean();

  // console.log(orders);
  // Get today's date
  const today = new Date();

  // Filter overdue items based on rent type and return date
  const overdueItems = orders.flatMap(
    (order) =>
      order.orderItems
        .filter(
          (item) =>
            item.orderType === "rent" &&
            item.isBack === false &&
            new Date(item.returnDate) < today
        )
        .map((item) => ({ user: order.user, item })) // Map user info with the item
  );

  // Extract unique user IDs of users with overdue rental books
  const overdueUserIds = [...new Set(overdueItems.map(({ user }) => user._id))];

  // Fetch the user details for those with overdue items
  const overdueUsers = await User.find({ _id: { $in: overdueUserIds } }).lean();

  // Return the information of overdue users
  if (overdueUsers.length > 0) {
    console.log(overdueUsers);
    return res.status(200).json({
      message: "Overdue users found",
      success: true,
      overdueUsers,
    });
  } else {
    return res.status(200).json({
      message: "No overdue users found",
      success: false,
    });
  }
};
