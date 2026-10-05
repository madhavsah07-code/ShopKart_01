const express = require("express");

const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
} = require("../controllers/customer.controller");

const authenticate = require("../middlewares/auth.middleware");

// Public routes

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);

// Protected routes

router.get("/me", authenticate, getMyProfile);

router.post("/logout", authenticate, logoutCustomer);

router.patch("/change-password", authenticate, changePassword);

module.exports = router;