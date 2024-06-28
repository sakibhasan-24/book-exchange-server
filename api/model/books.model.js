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
    title: {
      type: String,
      required: true,
    },
    address: {
      city: {
        type: String,
        required: true,
      },
      area: {
        type: String,
        required: true,
      },
      universityName: {
        type: String,
        required: true,
      },
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

    conditions: {
      type: String,
      required: true,
    },
    exchange: {
      type: Boolean,
      required: true,
    },
    fixedPrice: {
      type: Boolean,
      required: true,
    },

    bookOwner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    bookOwnerEmail: {
      type: String,
      required: true,
    },
    imagesUrls: {
      type: Array,
      required: true,
    },
    conditions: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
