const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} = require("../controllers/order.controller");

const authenticate = require("../middlewares/auth.middleware");

// All order routes require authentication
router.use(authenticate);

router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;
