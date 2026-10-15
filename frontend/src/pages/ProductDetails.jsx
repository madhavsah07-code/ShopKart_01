import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addToWishlist } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 3500);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        setProduct(data?.product || null);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Product not found.');
        } else if (err.response?.status === 400) {
          setError('Invalid product ID.');
        } else {
          setError('Something went wrong while loading the product.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getStockInfo = () => {
    if (!product) return {};
    if (product.stock === 0) {
      return {
        text: 'Out of Stock',
        className: 'stock-out',
        available: false,
      };
    } else if (product.stock <= 5) {
      return {
        text: `Only ${product.stock} left — Order soon!`,
        className: 'stock-low',
        available: true,
      };
    }
    return {
      text: `${product.stock} units in stock (Ready to ship)`,
      className: 'stock-in',
      available: true,
    };
  };

  const stockInfo = getStockInfo();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product._id}` } });
      return;
    }

    if (!stockInfo.available) return;

    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      showFeedback(`Added ${quantity} item${quantity > 1 ? 's' : ''} to your cart! 🛒`, 'success');
    } catch (err) {
      showFeedback(err.message || 'Could not add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product._id}` } });
      return;
    }

    try {
      await addToWishlist(product._id);
      showFeedback('Added to your Wishlist ❤️', 'success');
    } catch (error) {
      if (error.response?.status === 409) {
        showFeedback('Product is already in your wishlist', 'info');
      } else {
        showFeedback('Failed to add product to wishlist', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="product-details-main">
          <div className="products-state">
            <div className="spinner"></div>
            <p>Loading product details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="product-details-main">
          <div className="products-state products-state-error">
            <p>{error || 'Product could not be loaded'}</p>
            <button
              className="btn btn-retry"
              onClick={() => navigate('/products')}
            >
              Back to Catalog
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper product-details-page">
      <Navbar />

      <main className="product-details-main">
        <div className="product-details-container">
          {/* Breadcrumb / Back Navigation */}
          <button
            className="btn-back"
            onClick={() => navigate('/products')}
            id="back-to-products"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Products
          </button>

          <div className="product-details-grid">
            {/* Product Image Section */}
            <div className="product-details-image-section">
              <div className="product-details-image-wrapper">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-details-image"
                  onError={(e) => {
                    e.target.src =
                      'https://placehold.co/600x500/1e293b/94a3b8?text=No+Image';
                  }}
                />
                <span className="product-details-category-badge">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Info Section */}
            <div className="product-details-info">
              <h1 className="product-details-name">{product.name}</h1>

              <div className="product-details-price">
                {formatPrice(product.price)}
              </div>

              <div className={`product-details-stock ${stockInfo.className}`}>
                <span className="stock-dot"></span>
                <span>{stockInfo.text}</span>
              </div>

              <div className="product-details-divider"></div>

              <div className="product-details-section">
                <h3>Description</h3>
                <p className="product-details-description">
                  {product.description}
                </p>
              </div>

              <div className="product-details-section">
                <h3>Category</h3>
                <span className="product-details-category-tag">
                  {product.category}
                </span>
              </div>

              <div className="product-details-divider"></div>

              {/* Quantity Selector if in stock */}
              {stockInfo.available && (
                <div className="product-qty-selector-group">
                  <label htmlFor="product-qty">Quantity:</label>
                  <div className="qty-control-capsule">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span id="product-qty">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="qty-subtotal-preview">
                    Subtotal: <strong>{formatPrice(product.price * quantity)}</strong>
                  </span>
                </div>
              )}

              {/* Feedback Alert */}
              {feedback.text && (
                <div className={`product-detail-alert alert-${feedback.type}`}>
                  {feedback.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="product-details-actions">
                <button
                  className={`btn btn-add-to-cart ${
                    !stockInfo.available ? 'btn-disabled' : ''
                  }`}
                  disabled={!stockInfo.available || addingToCart}
                  onClick={handleAddToCart}
                  id="add-to-cart-btn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  {addingToCart
                    ? 'Adding to Cart...'
                    : stockInfo.available
                    ? `Add to Cart • ${formatPrice(product.price * quantity)}`
                    : 'Out of Stock'}
                </button>

                <button
                  className="btn btn-add-to-wishlist"
                  onClick={handleAddToWishlist}
                  id="add-to-wishlist-btn"
                >
                  ❤️ Save to Wishlist
                </button>
              </div>

              {/* Trust Badges */}
              <div className="product-trust-row">
                <div className="trust-pill">⚡ Fast Shipping</div>
                <div className="trust-pill">🛡️ 100% Genuine</div>
                <div className="trust-pill">🔒 Safe Payment</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetails;