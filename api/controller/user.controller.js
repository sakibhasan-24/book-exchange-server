import bcryptjs from "bcryptjs";
import User from "../model/user.model.js";
import Order from "../model/order.model.js";
import Book from "../model/books.model.js";

export const userUpdate = async (req, res) => {
  //   console.log(req.user.id, req.params);
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({
      error: "You can update only your account!",
    });
  }
  console.log(req.body);
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }
    req.body.password = bcryptjs.hashSync(req.body.password);
    if (req.body.userName) {
      if (req.body.userName.length < 6 || req.body.userName.length > 25) {
        return res.status(400).json({
          error: "Username must be between 6 and 25 characters long",
        });
      }
      if (!req.body.userName.match(/^[a-zA-Z0-9]+$/)) {
        return res.status(400).json({
          error: "Username can only contain letters and numbers",
        });
      }
    }
  }

  try {
    const updateUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        userName: req.body.userName,
        password: req.body.password,
        userEmail: req.body.userEmail,
        image: req.body.image,
      },
      { new: true }
    );
    console.log(updateUser);
    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      user: updateUser,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Wrong",
      success: false,
    });
  }
};

export const getAllUser = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      message: "You are not allowed to see all users",
      success: false,
    });
  }
  try {
    const users = await User.find();
    return res.status(200).json({
      message: "All users",
      success: true,
      users: users,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Wrong",
      success: false,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    return res.status(200).json({
      message: "User",
      success: true,
      user: user,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Wrong",
      success: false,
    });
  }
};

export const userDelete = async (req, res) => {
  console.log(!req.user.isAdmin);
  if (req.user.id !== req.params.userId && !req.user.isAdmin) {
    return res.status(403).json({
      message: "You can delete only your account!",
      success: false,
    });
  }
  try {
    const user = await User.findById(req.params.userId);
    if (user.isAdmin) {
      return res.status(403).json({
        message: "Admin accounts cannot be deleted!",
        success: false,
      });
    }
    const deltedUser = await User.findByIdAndDelete(req.params.userId);

    console.log(user);
    console.log(user);
    return res.status(200).json({
      message: "User deleted successfully",
      success: true,
      user: deltedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "Something Went Wrong...",
      success: false,
    });
  }
};

// get deliveryMan
export const getAllDeliveryMan = async (req, res) => {
  try {
    const deliveryMan = await User.find({ isDeliveryPerson: true });
    return res.status(200).json({
      message: "All DeliveryMan",
      success: true,
      deliveryMan,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "Something Went Wrong...",
      success: false,
    });
  }
};

// not used
export const userApply = async (req, res) => {
  const { userId } = req.params;
  const {
    deliveryManAddress,
    phoneNumber,
    additionalInfo,
    preferredArea,
    availability,
    experience,
    vehicleInfo,
  } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    if (userId === req.user.id) {
      user.isDeliveryPersonApplied = true;
      user.deliveryManAddress = deliveryManAddress;
      user.phoneNumber = phoneNumber;
      user.additionalInfo = additionalInfo;
      user.preferredArea = preferredArea;
      user.availability = availability;
      user.experience = experience;
      user.vehicleInfo = vehicleInfo;
      await user.save();
      return res.status(200).json({
        message: "Applied successfully",
        success: true,
        user: user,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const acceptedRequest = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    if (req.user.isAdmin) {
      user.isDeliveryPerson = true;
      user.deliveryApplicationStatus = "accepted";
      await user.save();
      return res.status(200).json({
        message: "Accepted successfully",
        success: true,
        user: user,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const rejectedRequest = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    if (req.user.isAdmin) {
      user.isDeliveryPerson = false;
      user.isDeliveryPersonApplied = false;
      user.deliveryApplicationStatus = "rejected";
      await user.save();
      return res.status(200).json({});
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

// system summary

export const getSystemSummary = async (req, res) => {
  if (req.user.isAdmin === false) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const now = new Date();

    // Calculate dates for current month and last month
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Fetch total data (all-time)
    const totalOrders = await Order.countDocuments({});
    const totalUsers = await User.countDocuments({});
    const totalBooks = await Book.countDocuments({});

    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfCurrentMonth },
    });
    const currentMonthUsers = await User.countDocuments({
      createdAt: { $gte: startOfCurrentMonth },
    });
    const currentMonthBooks = await Book.countDocuments({
      createdAt: { $gte: startOfCurrentMonth },
    });

    // Fetch last month's data (start of last month to start of current month)
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });
    const lastMonthBooks = await Book.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });

    const admin = await User.findOne({ isAdmin: true });
    const adminProfit = admin?.profits || 0;

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return (((current - previous) / previous) * 100).toFixed(2);
    };

    const orderChange = parseFloat(
      calculateChange(currentMonthOrders, lastMonthOrders)
    );
    const userChange = parseFloat(
      calculateChange(currentMonthUsers, lastMonthUsers)
    );
    const bookChange = parseFloat(
      calculateChange(currentMonthBooks, lastMonthBooks)
    );

    const users = await User.find();
    const deliveryMen = await User.find({ isDeliveryPerson: true });
    const blockedUsers = users.filter((us) => us.isRedAlert);

    const totalExpenses = admin?.expense || 0;
    const totalEarnings = admin?.totalEarnings || 0;
    return res.status(200).json({
      totalOrders,
      currentMonthOrders,
      lastMonthOrders,
      orderChange,

      totalUsers,
      currentMonthUsers,
      lastMonthUsers,
      userChange,

      totalBooks,
      currentMonthBooks,
      lastMonthBooks,
      bookChange,

      adminProfit, // Total profit from admin
      totalUsers: users.length, // Renamed to avoid duplication
      totalDeliveryMen: deliveryMen.length,
      blockedUserCount: blockedUsers.length,
      totalExpenses,
      totalEarnings,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
