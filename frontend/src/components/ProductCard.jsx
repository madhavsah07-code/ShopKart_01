import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToWishlist } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function ProductCard({ product, isWishlisted = false, onWishlistToggle }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [feedback, setFeedback] = useState('');

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      if (onWishlistToggle) {
        onWishlistToggle(product._id);
        return;
      }
      await addToWishlist(product._id);
      setWishlisted(true);
      showFeedback('Saved to Wishlist ❤️');
    } catch (error) {
      if (error.response?.status === 409) {
        showFeedback('Already in Wishlist');
      } else {
        showFeedback('Failed to update wishlist');
      }
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (product.stock === 0) return;

    setAddingToCart(true);
    try {
      await addToCart(product._id, 1);
      showFeedback('Added to Cart! 🛒');
    } catch (err) {
      showFeedback(err.message || 'Could not add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: 'Out of Stock', className: 'stock-out' };
    }
    if (product.stock <= 5) {
      return { text: `Only ${product.stock} left!`, className: 'stock-low' };
    }
    return { text: `In Stock (${product.stock})`, className: 'stock-in' };
  };

  const stockStatus = getStockStatus();

  return (
    <div
      className="product-card"
      id={`product-card-${product._id}`}
      onClick={() => navigate(`/products/${product._id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Product Image */}
      <div className="product-card-image">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.target.src =
              'https://placehold.co/400x300/1e293b/94a3b8?text=No+Image';
          }}
        />

        {product.category && (
          <span className="product-card-category">{product.category}</span>
        )}

        {/* Wishlist Button */}
        <button
          className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleAddToWishlist}
          aria-label="Wishlist"
          title="Save to Wishlist"
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Product Body */}
      <div className="product-card-body">
        <h3 className="product-card-name" title={product.name}>
          {product.name}
        </h3>

        <div className="product-card-price">{formatPrice(product.price)}</div>

        <div className={`product-card-stock ${stockStatus.className}`}>
          <span className="stock-dot"></span>
          <span>{stockStatus.text}</span>
        </div>

        {feedback && <div className="product-card-feedback">{feedback}</div>}

        {/* Actions Row */}
        <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-add-cart-card"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
          >
            {addingToCart ? (
              <span className="btn-loading">
                <span className="spinner spinner-sm"></span> Adding...
              </span>
            ) : product.stock === 0 ? (
              'Out of Stock'
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;