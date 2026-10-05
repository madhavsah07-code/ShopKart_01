const express = require("express");

const router = express.Router();


const { addToWishlist , getWishlist , removeFromWishlist } = require("../controllers/wishlist.controller");

const authenticate = require("../middlewares/auth.middleware");

//  add product to wishlist
router.post("/:productId", authenticate, addToWishlist);  

//     POST /wishlist/123
//         ↓
//    authenticate
//         ↓
//    addToWishlist



// get user's wishlist
router.get("/", authenticate, getWishlist);


// remove product from wishlist
router.delete("/:productId", authenticate, removeFromWishlist);

module.exports = router;