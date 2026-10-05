const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: "Price must be greater than 0",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// // Remove __v from JSON output
// productSchema.methods.toJSON = function () {
//   const product = this.toObject();
//   delete product.__v;
//   return product;
// };

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
