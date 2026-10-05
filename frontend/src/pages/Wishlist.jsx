import { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '../services/api';

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to handle removing a product from the wishlist

    const handleRemoveFromWishlist = async (productId) => {
        try {
            const data = await removeFromWishlist(productId);

            console.log("Remove wishlist response:", data);

            // Remove the product from the current UI
            setWishlist((currentWishlist) =>
                currentWishlist.filter(
                    (product) => product._id !== productId
                )
            );

        } catch (error) {
            console.error("Remove from wishlist error:", error);

            if (error.response?.status === 401) {
                alert("Please login first");
            } else if (error.response?.status === 404) {
                alert("Product is not in your wishlist");
            } else {
                alert("Failed to remove product from wishlist");
            }
        }
    };
    // Fetch wishlist on component mount
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const data = await getWishlist();

                console.log("Wishlist response:", data);

                setWishlist(data.wishlist || []);
            } catch (error) {
                console.error("Get wishlist error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    if (loading) {
        return <div>Loading wishlist...</div>;
    }

    return (
        <div className="wishlist-page">

            <h1>My Wishlist ❤️</h1>

            {wishlist.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.map((product) => (
                        <div
                            className="wishlist-card"
                            key={product._id}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                            />

                            <div className="wishlist-card-body">

                                <h2>{product.name}</h2>

                                <p>{product.description}</p>

                                <div className="wishlist-price">
                                    ₹{product.price}
                                </div>

                                <p>
                                    {product.stock > 0
                                        ? `${product.stock} units left`
                                        : 'Out of Stock'}
                                </p>
                                <button
                                    className="wishlist-remove-btn"
                                    onClick={() => handleRemoveFromWishlist(product._id)}
                                >
                                    🗑️ Remove from Wishlist
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default Wishlist;