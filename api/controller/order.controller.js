import SSLCommerzPayment from "sslcommerz-lts";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
const store_id = process.env.STORE_ID;
const store_password = process.env.STORE_PASS;
const isLive = false;

import Order from "../model/order.model.js";
import Book from "../model/books.model.js";

export const createOrders = async (req, res) => {
  if (req.user.isAdmin) {
    return res
      .status(401)
      .json({ message: "You are not authorized to perform this action" });
  }
  const {
    orderItems,
    paymentMethod,
    productPrice,
    shippingPrice,
    totalPrice,
    deliveryAddress,
  } = req.body;
  // console.log("rew", deliveryAddress);
  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "No order items", success: false });
  }

  try {
    const order = new Order({
      orderItems: orderItems.map((item) => ({
        ...item,
        product: item._id,
        bookOwner: item.bookOwner,
        _id: undefined,
      })),
      deliveryAddress,
      paymentMethod,
      productPrice,
      shippingPrice,
      totalPrice,

      user: req.user.id,
    });
    const createdOrder = await order.save();
    return res.status(201).json({ createdOrder, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// get order by id

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    // console.log(order);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getOrderByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "user",
      "name email"
    );
    return res.status(200).json({ orders, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const orders = await Order.find().populate("user", "name email");
      return res.status(200).json({ orders, success: true });
    } else {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// payment from user

export const createPayment = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "No request body", success: false });
  }
  if (req.user.isAdmin) {
    return res
      .status(503)
      .json({ message: "Admins cannot make payments", success: false });
  }

  // console.log("payment", data);
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    const tran_id = uuidv4();

    const data = {
      total_amount: order.totalPrice,
      currency: "BDT",
      tran_id,
      success_url: `http://localhost:5173/order/${order._id}`, // Redirect here on success
      fail_url: `http://localhost:5173/order/${order._id}`, // Redirect here on failure
      cancel_url: `http://localhost:5173/order/${order._id}`, // Optional: handle cancellation
      ipn_url: "http://localhost:3030/ipn",
      shipping_method: "Courier",

      product_name: "something",
      product_category: "something",
      product_profile: order.orderItems
        .map((item) => item.imagesUrls[0])
        .join(", "),
      cus_name: order.deliveryAddress.name,
      cus_email: order.deliveryAddress.email,
      cus_address: order.deliveryAddress.address,
      cus_country: "Bangladesh",
      cus_phone: order.deliveryAddress.phone,
      // Add the missing field
      ship_name: order.deliveryAddress.name, // Shipping name
      ship_add1: order.deliveryAddress.address,
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_password, isLive);
    const apiResponse = await sslcz.init(data);

    // console.log(apiResponse.status);
    // Redirect the user to the payment gateway
    let GatewayPageURL = apiResponse.GatewayPageURL;
    // console.log(GatewayPageURL);
    res.send(GatewayPageURL);
    if (apiResponse.status === "SUCCESS") {
      order.isPaid = true;
      order.isAvailable = false;
      order.bookStatus = "sell";
      order.paidAt = Date.now();
      order.transactionId = tran_id;
      const bookIds = order.orderItems.map((item) => item.product);
      await Promise.all(
        bookIds.map(async (bookId) => {
          await Book.updateOne(
            { _id: bookId },
            { $set: { bookStatus: "sold", isAvailable: false } } // Update the status to 'sold'
          );
        })
      );

      // order.paidAt = Date.now();
      await order.save();
      // console.log("new Order", order);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
