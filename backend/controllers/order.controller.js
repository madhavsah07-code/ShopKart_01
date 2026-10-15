const crypto = require("crypto");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

// Helper to get or init Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id === "your_test_key_id") {
    return null;
  }
  return new Razorpay({ key_id, key_secret });
};

// POST /orders/create-payment-order
// 1. Validates address & stock
// 2. Calculates live total server-side
// 3. Creates Razorpay order
// 4. Creates pending Order in DB
const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName?.trim() ||
      !shippingAddress.phone?.trim() ||
      !shippingAddress.address?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.state?.trim() ||
      !shippingAddress.pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required",
      });
    }

    const phoneClean = shippingAddress.phone.trim();
    if (!/^\d{10}$/.test(phoneClean)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    const pincodeClean = shippingAddress.pincode.trim();
    if (!/^\d{6}$/.test(pincodeClean)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be exactly 6 digits",
      });
    }

    // Fetch customer's cart
    const cart = await Cart.findOne({ customer: userId }).populate("items.product");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // Validate stock and compute total server-side
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available",
        });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product.name}". Only ${item.product.stock} available.`,
        });
      }

      const itemTotal = item.product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image || "",
      });
    }

    // Minimum amount check
    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    // Create Razorpay Order
    const rzp = getRazorpayInstance();
    let rzpOrderId = "";

    if (rzp) {
      const options = {
        amount: Math.round(totalAmount * 100), // in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
      const rzpOrder = await rzp.orders.create(options);
      rzpOrderId = rzpOrder.id;
    } else {
      // Test/Demo fallback when Razorpay credentials are not provided
      rzpOrderId = `order_sim_${Date.now()}`;
    }

    // Save pending Order in MongoDB
    const order = await Order.create({
      customer: userId,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: phoneClean,
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: pincodeClean,
      },
      totalAmount,
      paymentStatus: "pending",
      orderStatus: "processing",
      razorpayOrderId: rzpOrderId,
    });

    return res.status(201).json({
      success: true,
      orderId: order._id,
      amount: totalAmount,
      currency: "INR",
      razorpayOrderId: rzpOrderId,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      isSimulated: !rzp,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
};

// POST /orders/verify-payment
// 1. Verifies Razorpay signature
// 2. Marks order paid
// 3. Decrements inventory stock
// 4. Clears customer cart
const verifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID is required",
      });
    }

    const order = await Order.findOne({ _id: orderId, customer: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Order is already verified and paid",
        order,
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const isMock = !key_secret || key_secret === "your_test_key_secret";

    if (!isMock) {
      // Cryptographic signature verification
      const expectedSignature = crypto
        .createHmac("sha256", key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        order.paymentStatus = "failed";
        await order.save();
        return res.status(400).json({
          success: false,
          message: "Payment verification failed. Invalid signature.",
        });
      }
    }

    // Mark order as paid
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id || `pay_${Date.now()}`;
    order.razorpaySignature = razorpay_signature || "verified";
    await order.save();

    // Decrement stock for purchased products
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { customer: userId },
      { $set: { items: [] } }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

// GET /orders
// Fetch authenticated customer's order history
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ customer: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /orders/:id
// Fetch single order details with ownership verification
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({ _id: id, customer: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
};
