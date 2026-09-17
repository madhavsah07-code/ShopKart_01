const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const customerRoutes = require("./routes/customer.routes");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/customers", customerRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ShopKart API is running" });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`ShopKart server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
