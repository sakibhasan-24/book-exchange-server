import SSLCommerzPayment from "sslcommerz-lts";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
const store_id = process.env.STORE_ID;
const store_password = process.env.STORE_PASS;
const isLive = false;

import Order from "../model/order.model.js";
import Book from "../model/books.model.js";
import DeliveryMan from "../model/deliveryMan.model.js";
import User from "../model/user.model.js";

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
            { $set: { bookStatus: "available", isAvailable: false } } // Update the status to 'sold'
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

export const assignDeliveryMan = async (req, res) => {
  const { orderId, deliveryManId } = req.body;
  console.log(req.body);
  try {
    // Check if the user is an admin first
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    // Fetch the order by ID
    const order = await Order.findById({ _id: orderId });
    // console.log(order);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    // console.log(order?.assignedDeliveryMan);
    if (order.assignedDeliveryMan) {
      console.log("Delivery Man already assigned", order?.assignedDeliveryMan);
      return res.status(400).json({
        message: "Delivery Man already assigned",
        success: false,
      });
    }

    // Fetch the delivery man by ID
    const deliveryMan = await User.findById({ _id: deliveryManId });
    console.log("d", deliveryMan);
    if (!deliveryMan) {
      return res
        .status(404)
        .json({ message: "Delivery Man not found", success: false });
    }

    // Assign the delivery man to the order
    order.assignedDeliveryMan = deliveryManId;
    // deliveryMan.assignedOrders.push(order._id);
    // deliveryMan.status =
    //   deliveryMan?.assignedOrders?.length > 0 ? "working" : "available";

    await order.save();
    // await deliveryMan.save();
    // console.log(deliveryMan);

    return res.status(200).json({
      message: "Delivery Man successfully assigned",
      order,
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
// export const assignDeliveryMan = async (req, res) => {
//   const { orderId, deliveryManId } = req.body;

//   try {
//     // Check if the user is an admin first
//     if (!req.user.isAdmin) {
//       return res.status(403).json({ message: "Unauthorized", success: false });
//     }

//     // Fetch the order by ID
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res
//         .status(404)
//         .json({ message: "Order not found", success: false });
//     }

//     if (order.assignedDeliveryMan) {
//       return res.status(400).json({
//         message: "Delivery Man already assigned",
//         success: false,
//       });
//     }

//     // Fetch the delivery man by ID
//     const deliveryMan = await DeliveryMan.findById(deliveryManId);
//     if (!deliveryMan) {
//       return res
//         .status(404)
//         .json({ message: "Delivery Man not found", success: false });
//     }

//     // Assign the delivery man to the order
//     order.assignedDeliveryMan = deliveryManId;

//     // Save the order first
//     await order.save();

//     // After the order is saved, update the delivery man
//     deliveryMan.assignedOrders.push(order._id);
//     deliveryMan.status =
//       deliveryMan.assignedOrders.length > 0 ? "working" : "available";

//     // Save the delivery man after saving the order
//     return res.status(200).json({
//       message: "Delivery Man successfully assigned",
//       order,
//       success: true,
//     });
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(500)
//       .json({ message: "Internal server error", success: false });
//   }
// };

export const assignDeliveryManProduct = async (req, res) => {
  const { orderId, deliveryManId } = req.body;
  // console.log("body", req.body);
  if (!orderId || !deliveryManId) {
    return res.status(400).json({
      message: "Please provide orderId and deliveryManId",
      success: false,
    });
  }
  const deliveryMan = await User.findById({ _id: deliveryManId });
  if (!deliveryMan) {
    return res
      .status(404)
      .json({ message: "Delivery Man not found", success: false });
  }
  const order = await Order.findById({ _id: orderId });
  if (!order) {
    return res.status(404).json({ message: "Order not found", success: false });
  }
  if (order?.assignedDeliveryMan) {
    console.log("already assigned");
    return res
      .status(404)
      .json({ message: "Order already assigned", success: false });
  }
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { assignedDeliveryMan: deliveryManId }, // Update with delivery man ID
      { new: true } // Return the updated document
    );
    deliveryMan.assignedOrders.push(order._id);
    await deliveryMan.save(); // Save the updated delivery man

    return res.status(200).json({
      message: "Delivery Man successfully assigned",
      order: updatedOrder,
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getDeliveryManProducts = async (req, res) => {
  const deliveryManId = req.params.id;
  console.log(deliveryManId);
  try {
    // const deliveryMan = await Order.findById({
    //   assignedDeliveryMan: deliveryManId,
    // });
    const deliveryManOrders = await Order.find({
      assignedDeliveryMan: deliveryManId,
    });
    if (!deliveryManOrders) {
      return res
        .status(404)
        .json({ message: "Delivery Man not found", success: false });
    }

    return res.status(200).json({
      message: "Delivery Man products fetched successfully",
      products: deliveryManOrders,
      success: true,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err, success: false });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params; // This is the order ID
  const { deliveryStatus } = req.body;
  console.log(deliveryStatus);
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { deliveryStatus },
      { new: true }
    );
    console.log(updatedOrder);

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({ message: "Update failed", success: false });
  }
};
