// This file contains all the logic for customer authentication.

const Customer = require("../models/customer.model");
const generateTokenAndSetCookie = require("../utils/generateToken");

// ---------------------------------------------------
// 1. REGISTER
// ---------------------------------------------------

async function registerCustomer(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check all fields are present
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create customer
    // Password will be hashed automatically
    // by customer.model.js pre-save middleware
    const customer = await Customer.create({
      fullName,
      email,
      password,
      phone,
    });

    // Send response without password
    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

// ---------------------------------------------------
// 2. LOGIN
// ---------------------------------------------------

async function loginCustomer(req, res) {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await customer.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT and store it in HttpOnly cookie
    generateTokenAndSetCookie(res, customer._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

// ---------------------------------------------------
// 3. MY PROFILE
// ---------------------------------------------------

async function getMyProfile(req, res) {
  try {
    // authenticate middleware adds req.user
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

// ---------------------------------------------------
// 4. LOGOUT
// ---------------------------------------------------

async function logoutCustomer(req, res) {
  try {
    // Remove JWT cookie
    res.clearCookie("token");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

// ---------------------------------------------------
// 5. CHANGE PASSWORD
// ---------------------------------------------------

async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    // Check required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new passwords are required",
      });
    }

    // Check new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check old password
    const isOldPasswordCorrect =
      await customer.comparePassword(oldPassword);

    if (!isOldPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Set new password
    // customer.model.js pre-save middleware
    // will automatically hash it
    customer.password = newPassword;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

// ---------------------------------------------------
// EXPORTS
// ---------------------------------------------------

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
};