import mongoose from "mongoose";

/* 
1-name
2-category
3-description
4-price
5-cover Image
6-prefered location
7-exchanges
8-seller(owner)
9-demo pages
10-conditions(book)
11-


   


*/
const bookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    preferedLocation: {
      type: String,
      required: true,
    },
    exchanges: {
      type: Boolean,
      required: true,
    },
    fixedPrice: {
      type: Boolean,
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    demoImages: {
      type: Array,
      required: true,
    },
    conditions: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
