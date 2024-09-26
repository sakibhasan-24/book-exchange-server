import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import deliveryManData from "./data/deliveryman.js";
import User from "./api/model/user.model.js";

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
    const hashedDeliveryManData = await Promise.all(
      deliveryManData.map(async (man) => {
        const hashedPassword = await bcryptjs.hash(man.password, 10);
        return { ...man, password: hashedPassword };
      })
    );

    await User.insertMany(hashedDeliveryManData);
    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
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
