const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

const authenticate = require("../middlewares/auth.middleware");

// All cart routes require authentication
router.use(authenticate);

router.get("/", getCart);
router.post("/:productId", addToCart);
router.patch("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
