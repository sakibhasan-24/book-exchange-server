import mongoose from "mongoose";

const deliveryManSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    assignedOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

deliveryManSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
deliveryManSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
const DeliveryMan = mongoose.model("DeliveryMan", deliveryManSchema);

export default DeliveryMan;
