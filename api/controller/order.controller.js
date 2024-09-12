import SSLCommerzPayment from "sslcommerz-lts";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
const store_id = process.env.STORE_ID;
const store_password = process.env.STORE_PASS;
const isLive = false;

import Order from "../model/order.model.js";

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
  console.log("rew", deliveryAddress);
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
    console.log(order);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order, success: true });
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
};
try {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found", success: false });
  }
  // console.log("payment ", order);
  const data = {
    total_amount: order.totalPrice,
    currency: "BDT",
    tran_id: uuidv4(),
    success_url: `http://localhost:3000/api/v1/orders/payment-success/${order._id}`,
    fail_url: `http://localhost:3000/api/v1/orders/payment-failed/${order._id}`,
    cancel_url: "http://localhost:3030/cancel",
    ipn_url: "http://localhost:3030/ipn",
    shipping_method: "Courier",
    product_name: order.title,
    product_profile: order.orderItems,
    cus_name: order.deliveryAddress.name,
    cus_email: order.deliveryAddress.email,
    cus_address: order.deliveryAddress.address,
    cus_country: "Bangladesh",
    cus_phone: order.deliveryAddress.phone,
  };
  const sslcz = new SSLCommerzPayment(store_id, store_password, isLive);
  const apiResponse = await sslcz.init(data);

  // Redirect the user to the payment gateway
  let GatewayPageURL = apiResponse.GatewayPageURL;
  // console.log(GatewayPageURL);
  res.send(GatewayPageURL);
  if (apiResponse.status === "SUCCESS") {
    order.isPaid = true;
    order.paidAt = Date.now();
    await order.save();
  }
} catch (error) {
  return res.status(500).json({ message: error.message, success: false });
}
