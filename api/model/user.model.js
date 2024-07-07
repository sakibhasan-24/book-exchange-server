import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
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
    isDeliveryPersonApplied: {
      type: Boolean,
      default: false,
    },
    deliveryApplicationStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    deliveryApplicationDate: {
      type: Date,
      default: Date.now(),
    },
    password: {
      type: String,
      required: true,
    },
    deliveryManAddress: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    preferredArea: {
      type: String,
    },
    availability: {
      type: String,
    },
    vehicleInfo: {
      type: String,
    },
    experience: {
      type: String,
    },
    additionalInfo: {
      type: String,
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

export default User;
