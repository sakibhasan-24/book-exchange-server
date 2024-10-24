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
import SslCommerzPayment from "sslcommerz-lts/api/payment-controller.js";
const clientURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://book-management-57c93.web.app";

const serverURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://book-exchange-server.vercel.app";
// export const createOrders = async (req, res) => {
//   if (req.user.isAdmin) {
//     return res
//       .status(401)
//       .json({ message: "You are not authorized to perform this action" });
//   }
//   const {
//     orderItems,
//     paymentMethod,
//     productPrice,
//     shippingPrice,
//     totalPrice,
//     deliveryAddress,
//   } = req.body;
//   console.log("rew", orderItems);
//   if (!orderItems || orderItems.length === 0) {
//     return res.status(400).json({ message: "No order items", success: false });
//   }

//   try {
//     const order = new Order({
//       orderItems: orderItems.map((item) => ({
//         ...item,
//         product: item._id,
//         bookOwner: item.bookOwner,
//         returnDate: item.returnDate,
//         durationDate: item.durationDate,
//         remainingDays: item.remainingDays,
//         _id: undefined,
//       })),
//       deliveryAddress,
//       paymentMethod,
//       productPrice,
//       shippingPrice,
//       totalPrice,
//       user: req.user.id,
//     });

//     const createdOrder = await order.save();
//     return res.status(201).json({ createdOrder, success: true });
//   } catch (error) {
//     return res.status(500).json({ message: error.message, success: false });
//   }
// };
// update create order
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

  // console.log("body", req.body);
  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "No order items", success: false });
  }

  try {
    // Map through the order items and conditionally add the rental fields
    const mappedOrderItems = orderItems.map((item) => {
      const orderItem = {
        title: item.title,
        imagesUrls: item.imagesUrls,
        price: item.price,
        orderType: item.orderType,
        product: item._id,
        bookOwner: item.bookOwner,
        bookStatus: item.orderType,
        _id: undefined,
      };

      if (item.orderType === "rent") {
        orderItem.durationDate = item.durationDate;
        orderItem.returnDate = item.returnDate;

        const today = new Date();
        const returnDate = new Date(item.returnDate);
        returnDate.setDate(returnDate.getDate());
        // console.log("r", new Date(returnDate).toLocaleString());
        const diffTime = returnDate.getTime() - today.getTime();
        // console.log(diffTime);
        const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // console.log(remainingDays);
        orderItem.remainingDays = remainingDays;
      }

      return orderItem;
    });

    const order = new Order({
      orderItems: mappedOrderItems,
      deliveryAddress,
      paymentMethod,
      productPrice,
      shippingPrice,
      totalPrice,
      user: req.user.id,
    });

    // console.log("d", order);
    const createdOrder = await order.save();
    return res.status(201).json({ createdOrder, success: true });
  } catch (error) {
    console.log(error);
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
      // Fetch all orders and populate user details
      const orders = await Order.find().populate(
        "user",
        "name email totalEarnings"
      );

      // Retrieve the admin user
      const adminUser = await User.findById(req.user.id);
      const allUsers = await User.find({ isAdmin: false });

      // Calculate total earnings from all orders
      const totalEarnings = orders.reduce(
        (acc, order) => acc + Number(order.productPrice),
        0
      );
      // console.log(orders.map((i) => i.productPrice));

      // Overwrite admin's total earnings with the newly calculated value
      adminUser.totalEarnings = totalEarnings;

      // Calculate profits (total earnings - expense)
      // console.log(totalEarnings - adminUser?.expense);
      adminUser.profits = Number(totalEarnings) - Number(adminUser.expense);

      // Calculate profit percentage
      let profitPercentage = 0;
      if (Number(adminUser.totalEarnings) > 0) {
        profitPercentage =
          (Number(adminUser.profits) / Number(adminUser.totalEarnings)) * 100;
      }

      // console.log("profit", profitPercentage);
      // console.log("expense", adminUser.expense);
      // console.log("totalEarnings", adminUser.totalEarnings);
      const shippedOrders = await Order.find({ isDelivered: false });
      const deliveredOrders = await Order.find({ isDelivered: true });
      // console.log(deliveredOrders);

      // Save the updated admin user in the database
      await adminUser.save();
      console.log("shipped orders", shippedOrders);
      console.log("delivered orders", deliveredOrders);

      // Return the orders, success response, adminUser data, and profit percentage
      return res.status(200).json({
        orders,
        success: true,
        adminUser,
        profitPercentage: profitPercentage.toFixed(2),
        shippedOrders,
        deliveredOrders,
        allUsers,
      });
    } else {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// payment from user

// export const createPayment = async (req, res) => {
//   if (!req.body) {
//     return res.status(400).json({ message: "No request body", success: false });
//   }
//   if (req.user.isAdmin) {
//     return res
//       .status(503)
//       .json({ message: "Admins cannot make payments", success: false });
//   }

//   // console.log("payment", data);
//   try {
//     const order = await Order.findById(req.params.id);
//     console.log("order", order);
//     if (!order) {
//       return res
//         .status(404)
//         .json({ message: "Order not found", success: false });
//     }

//     const tran_id = uuidv4();

//     const data = {
//       total_amount: order.totalPrice,
//       currency: "BDT",
//       tran_id,
//       success_url: `http://localhost:5173/success?tran_id=${tran_id}`,
//       fail_url: `http://localhost:5173/order/${order._id}`, // Redirect here on failure
//       cancel_url: `http://localhost:5173/order/${order._id}`,
//       ipn_url: "http://localhost:3030/ipn",
//       shipping_method: "Courier",

//       product_name: "something",
//       product_category: "something",
//       product_profile: order.orderItems
//         .map((item) => item.imagesUrls[0])
//         .join(", "),
//       cus_name: order.deliveryAddress.name,
//       cus_email: order.deliveryAddress.email,
//       cus_address: order.deliveryAddress.address,
//       cus_country: "Bangladesh",
//       cus_phone: order.deliveryAddress.phone,
//       // Add the missing field
//       ship_name: order.deliveryAddress.name, // Shipping name
//       ship_add1: order.deliveryAddress.address,
//       ship_city: "Dhaka",
//       ship_state: "Dhaka",
//       ship_postcode: 1000,
//       ship_country: "Bangladesh",
//     };
//     // console.log(data.success_url);

//     const sslcz = new SSLCommerzPayment(store_id, store_password, isLive);
//     const apiResponse = await sslcz.init(data);

//     console.log(apiResponse.GatewayPageURL);
//     if (apiResponse?.GatewayPageURL) {
//       console.log("api", apiResponse?.GatewayPageURL);
//       res.redirect(apiResponse.GatewayPageURL); // Only respond once here
//     } else {
//       return res.status(400).json({ message: "Something went wrong" });
//     }

//     if (apiResponse.status === "SUCCESS") {
//       order.isPaid = true;
//       order.isAvailable = false;
//       order.paidAt = Date.now();
//       order.transactionId = tran_id;
//       res.redirect("http://localhost:5173/success");
//       // order.user = req.user.id;
//       const bookIds = order.orderItems.map((item) => item.product);
//       const orderType = order.orderItems.map((item) => item.orderType);

//       await Promise.all(
//         order.orderItems.map(async (item) => {
//           await Book.updateOne(
//             { _id: item.product },
//             { $set: { bookStatus: item.orderType, isAvailable: false } }
//           );
//         })
//       );

//       // order.paidAt = Date.now();
//       await order.save();
//       // console.log("new Order", order);
//     }
//   } catch (error) {
//     return res.status(500).json({ message: error.message, success: false });
//   }
// };
export const createPayment = async (req, res) => {
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
      success_url: `${serverURL}/api/order/success?tran_id=${tran_id}`,
      fail_url: `${serverURL}/api/order/failed?tran_id=${tran_id}`, // Redirect here on failure
      cancel_url: `http://localhost:5173/order/${order._id}`,
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
    try {
      const sslcz = new SSLCommerzPayment(store_id, store_password, isLive);
      const apiResponse = await sslcz.init(data); // This sends a request to the SSLCommerz API

      // console.log(apiResponse);
      if (apiResponse?.GatewayPageURL) {
        res.json({ url: apiResponse.GatewayPageURL });
        // Send the URL back to the frontend
        order.transactionId = tran_id;
        await order.save();
      } else {
        return res
          .status(400)
          .json({ message: "Failed to initialize payment." });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
export const handlePaymentSuccess = async (req, res) => {
  const tran_id = req.query.tran_id;
  // console.log("handlePaymentSuccess", tran_id);
  try {
    const order = await Order.findOne({ transactionId: tran_id });

    // console.log(order);
    const books = await Book.find({
      _id: { $in: order.orderItems.map((i) => i.product) },
    });
    // console.log("books", books);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    const isAnySoldOrRent = books.some(
      (book) => book.bookStatus === "sell" || book.bookStatus === "rent"
    );
    // console.log(isAnySoldOrRent);
    if (isAnySoldOrRent) {
      return res.redirect(`${clientURL}/order/${order._id}`);
    }
    // await Promise.all(
    //   order.orderItems.map(async (item) => {
    //     // console.log("uiii", item);-
    //     await Book.updateOne(
    //       { _id: item.product },
    //       { $set: { bookStatus: item.orderType, isAvailable: false } }
    //     );
    //   })
    // );
    await Promise.all(
      order.orderItems.map(async (item) => {
        if (item.orderType === "rent") {
          await Book.updateOne(
            { _id: item.product },
            {
              $set: { bookStatus: "rent", isAvailable: false },
              $inc: { numberOfTimesRent: 1 },
            }
          );
        } else {
          await Book.updateOne(
            { _id: item.product },
            { $set: { bookStatus: "sell", isAvailable: false } }
          );
        }
      })
    );
    const orderUpdate = await Order.findByIdAndUpdate(
      order._id,
      { isPaid: true, paidAt: Date.now(), transactionId: tran_id },
      { new: true }
    );
    console.log(order);

    return res.redirect(`${clientURL}/order/${order._id}`);
  } catch (error) {
    console.error("Error validating payment:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};
export const handlePaymentFailed = async (req, res) => {
  console.log("hit");
  const tran_id = req.query.tran_id;
  if (!tran_id) {
    return res.status(400).json({ message: "Invalid request", success: false });
  }
  try {
    const order = await Order.findOne({ transactionId: tran_id });
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    const orderUpdate = await Order.findByIdAndUpdate(
      order._id,
      { isPaid: false, transactionId: tran_id },
      { new: true }
    );

    return res.redirect(`${clientURL}/order/${order._id}`);
  } catch {
    return res.status(401).json({ message: "Something went wrong" });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  // console.log(req.body);
  // console.log(id);
  if (req.user.id !== userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const order = await Order.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Order deleted successfully", success: true });
  } catch {
    return res
      .status(401)
      .json({ message: "Something went wrong", success: false });
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
  const { id } = req.params;
  const { deliveryStatus } = req.body;
  console.log(deliveryStatus);
  try {
    // const updatedOrderReturnDate
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        deliveryStatus,
        isDelivered: true,
        deliveredAt: deliveryStatus === "Delivered" ? new Date() : null,
      },
      { new: true }
    );

    console.log(updatedOrder);

    if (!updatedOrder) {
      console.log("s");
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
    console.log(err);
    return res.status(500).json({ message: "Update failed", success: false });
  }
};

// export const createPayment = async (req, res) => {
//   // const payment = new PaymentSession();
//   if (!req.body) {
//     return res.status(400).json({ message: "No request body", success: false });
//   }
//   if (req.user.isAdmin) {
//     return res
//       .status(503)
//       .json({ message: "Admins cannot make payments", success: false });
//   }

//   // console.log("payment", data);
//   try {
//     const order = await Order.findById(req.params.id);
//     console.log("order", order);
//     if (!order) {
//       return res
//         .status(404)
//         .json({ message: "Order not found", success: false });
//     }

//     const tran_id = uuidv4();

//     const data = {
//       total_amount: order.totalPrice,
//       currency: "BDT",
//       tran_id,
//       success_url: `http://localhost:5173/success?tran_id=${tran_id}`,
//       fail_url: `http://localhost:5173/order/${order._id}`, // Redirect here on failure
//       cancel_url: `http://localhost:5173/order/${order._id}`,
//       ipn_url: "http://localhost:3030/ipn",
//       shipping_method: "Courier",

//       product_name: "something",
//       product_category: "something",
//       product_profile: order.orderItems
//         .map((item) => item.imagesUrls[0])
//         .join(", "),
//       cus_name: order.deliveryAddress.name,
//       cus_email: order.deliveryAddress.email,
//       cus_address: order.deliveryAddress.address,
//       cus_country: "Bangladesh",
//       cus_phone: order.deliveryAddress.phone,
//       // Add the missing field
//       ship_name: order.deliveryAddress.name, // Shipping name
//       ship_add1: order.deliveryAddress.address,
//       ship_city: "Dhaka",
//       ship_state: "Dhaka",
//       ship_postcode: 1000,
//       ship_country: "Bangladesh",
//     };
//     const payment = new SslCommerzPayment(store_id, store_password, isLive);
//     const tran_id = uuidv4();
//   } catch {
//     return res.status(401).json({ message: "something went wrong" });
//   }
// };
