const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");

const addToWishlist = async (req, res) => {
    try{
        const { productId } = req.params;
        const userId = req.user._id;
        // Check if productId is a valid ObjectId
        if(!mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        // Check if product exists
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Check if product is already in user's wishlist
        const alreadyInWishlist = req.user.wishlist.some(

            item => item.toString() === productId
        );
        if(alreadyInWishlist){
            return res.status(409).json({
                success: false,
                message: "Product is already in wishlist",
            });
        }


        // Add product to user's wishlist
        req.user.wishlist.push(productId);
        await req.user.save();     
        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
        });

    }catch (error) {
        console.error("Add to wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    }
}


const getWishlist = async (req, res) => {
    try {
        const customer = await Customer
        .findById(req.user._id)
        .populate("wishlist");

        return res.status(200).json({
            success: true,
            wishlist: customer.wishlist,
        });
    }catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


const removeFromWishlist = async (req, res) => {


    try{
        const { productId } = req.params;
        const userId = req.user._id;

        // Check if productId is a valid ObjectId
        if(!mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        // Check if product exists
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        // Check if product is in user's wishlist

        const alreadyInWishlist = req.user.wishlist.some(
            item => item.toString() === productId
        );

        if(!alreadyInWishlist){
            return res.status(404).json({
                success: false,
                message: "Product is not in wishlist",
            });
        }
        // Remove product from user's wishlist

        req.user.wishlist = req.user.wishlist.filter(
            (item) => item.toString() !== productId
        );

        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
        });

    }catch(error){
        console.error("Remove from wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }

}


module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};