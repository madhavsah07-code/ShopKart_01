const mongoose = require("mongoose");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

// GET /cart
// Fetch the authenticated user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ customer: userId }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({ customer: userId, items: [] });
    }

    // Filter out items where the product no longer exists in DB
    const validItems = cart.items.filter((item) => item.product != null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Calculate subtotal and count
    const totalCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (acc, item) => acc + (item.product?.price || 0) * item.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        totalCount,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// POST /cart/:productId
// Add a product or increase quantity
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const qtyToAdd = Math.max(1, parseInt(req.body?.quantity, 10) || 1);
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    let cart = await Cart.findOne({ customer: userId });
    if (!cart) {
      cart = new Cart({ customer: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + qtyToAdd;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} items in stock.`,
        });
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      if (qtyToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${qtyToAdd}. Only ${product.stock} items in stock.`,
        });
      }
      cart.items.push({ product: productId, quantity: qtyToAdd });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate("items.product");

    const totalCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (acc, item) => acc + (item.product?.price || 0) * item.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: {
        _id: cart._id,
        items: cart.items,
        totalCount,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PATCH /cart/:productId
// Update item quantity (min 1, max stock)
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (newQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    const cart = await Cart.findOne({ customer: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cart.items[itemIndex].quantity = newQty;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("items.product");
    const totalCount = updatedCart.items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = updatedCart.items.reduce(
      (acc, item) => acc + (item.product?.price || 0) * item.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: {
        _id: updatedCart._id,
        items: updatedCart.items,
        totalCount,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE /cart/:productId
// Remove a single product from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const cart = await Cart.findOne({ customer: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("items.product");
    const totalCount = updatedCart.items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = updatedCart.items.reduce(
      (acc, item) => acc + (item.product?.price || 0) * item.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: {
        _id: updatedCart._id,
        items: updatedCart.items,
        totalCount,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE /cart
// Clear all items in cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ customer: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
