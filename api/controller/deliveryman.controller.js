import DeliveryMan from "../model/deliveryMan.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export const getAllDeliveryman = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const deliveryman = await DeliveryMan.find();
      return res.status(200).json({ deliveryman, success: true });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getDeliveryManById = async (req, res) => {
  try {
    const deliveryman = await DeliveryMan.findById(req.params.id);
    if (!deliveryman) {
      return res
        .status(404)
        .json({ message: "Deliveryman not found", success: false });
    }

    console.log(deliveryman);
    return res.status(200).json({ deliveryman, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
export const deliveryManLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const deliveryMan = await DeliveryMan.findOne({ email });

    if (!deliveryMan) {
      return res
        .status(404)
        .json({ message: "DeliveryMan not found", success: false });
    }

    console.log(deliveryMan);
    const matchPassword = bcryptjs.compareSync(password, deliveryMan.password);
    // console.log(isPasswordValid);
    console.log(matchPassword);

    if (!matchPassword) {
      return res
        .status(400)
        .json({ message: "Invalid password", success: false });
    }

    const token = jwt.sign(
      {
        id: deliveryMan._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
      })
      .json({
        message: "Login successfully",
        success: true,
        deliveryMan: {
          _id: deliveryMan._id,
          name: deliveryMan.name,
          email: deliveryMan.email,
          phone: deliveryMan.phone,
          assignedOrders: deliveryMan.assignedOrders,
        },
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const deliveryManSignOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.status(200).json({
      message: "User signed out successfully",
      success: true,
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message,
      success: false,
    });
  }
};
