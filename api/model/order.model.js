import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        title: { type: String, required: true },
        imagesUrls: { type: Array, required: true },
        price: { type: Number, required: true },
        orderType: {
          type: String,
          required: true,
          enum: ["sell", "rent"],
        },
        durationDate: {
          type: Date,
          required: function () {
            return this.orderType === "rent";
          },
          returnDate: {
            type: Date,
            required: function () {
              return this.orderType === "rent";
            },
          },
          remainingDays: {
            type: Number,
            required: function () {
              return this.orderType === "rent";
            },
          },
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        bookOwner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    deliveryAddress: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    productPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },

    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    transactionId: {
      type: String,
    },
    deliveryStatus: {
      type: String,
      enum: [
        "Not Delivered",
        "Delivery Man Collect From Store",
        "On the Way",
        "Delivered",
      ],
      default: "Not Delivered",
    },
    assignedDeliveryMan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryMan",
      default: null,
    },
    deliveredAt: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
