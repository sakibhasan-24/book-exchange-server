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
