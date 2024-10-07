import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      unique: true,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isDeliveryPerson: {
      type: Boolean,
      default: false,
    },
    isRedAlert: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "deliveryMan"],
      default: "user",
    },
    assignedOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: function () {
          return this.role === "deliveryMan";
        },
      },
    ],
    totalEarnings: {
      type: Number,
      default: function () {
        return this.role === "user" || this.role === "admin" ? 0.0 : undefined;
      },
    },
    profits: {
      type: Number,
      default: function () {
        return this.role === "admin" ? 0.0 : undefined;
      },
    },
    expense: {
      type: Number,
      default: function () {
        return this.role === "admin" ? 0.0 : undefined;
      },
    },
    image: {
      type: String,
      default:
        "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
userSchema.pre("save", function (next) {
  if (this.isNew) {
    // Check role and set default values
    if (this.role === "user" || this.role === "admin") {
      this.totalEarnings = 0.0;
    } else {
      this.totalEarnings = undefined; // Or delete the field
    }

    if (this.role === "admin") {
      this.profits = 0.0;
      this.expense = 0.0;
    } else {
      this.profits = undefined; // Or delete the field
      this.expense = undefined; // Or delete the field
    }
  }
  next();
});

export default User;
