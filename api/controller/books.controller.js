import Book from "../model/books.model.js";

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
  console.log(existingBook);
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
