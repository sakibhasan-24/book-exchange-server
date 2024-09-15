import mongoose from "mongoose";

import dotenv from "dotenv";
import deliveryManData from "./data/deliveryman.js";
import DeliveryMan from "./api/model/deliveryMan.model.js";
dotenv.config();
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log(err);
  });

const importData = async () => {
  try {
    const createdDeliveryMan = await User.insertMany(deliveryManData);

    await DeliveryMan.insertMany(createdDeliveryMan);
    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    console.log("Data Destroyed!");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
