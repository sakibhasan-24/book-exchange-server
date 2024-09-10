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
