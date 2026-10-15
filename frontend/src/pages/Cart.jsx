import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { cart, cartCount, cartSubtotal, loading, error, updateQuantity, removeFromCart, refreshCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleQtyChange = async (productId, currentQty, delta, maxStock) => {
    const targetQty = currentQty + delta;
    if (targetQty < 1) return;
    if (targetQty > maxStock) return;
    await updateQuantity(productId, targetQty);
  };

  return (
    <div className="page-wrapper cart-page-wrapper">
      <Navbar />

      <main className="cart-main container">
        <div className="cart-header">
          <h1>Shopping Cart ({cartCount})</h1>
          <p>Review items in your cart before proceeding to safe checkout</p>
        </div>

        {error && (
          <div className="cart-error-banner alert-error">
            <span>{error}</span>
            <button className="btn-retry-inline" onClick={refreshCart}>
              Retry
            </button>
          </div>
        )}

        {authLoading || loading ? (
          <div className="products-state">
            <div className="spinner"></div>
            <p>Loading your shopping cart...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="cart-empty-card">
            <span className="empty-cart-icon">🛒</span>
            <h2>Sign in to view your cart</h2>
            <p>Your shopping cart is securely saved in your customer account.</p>
            <Link to="/login" state={{ from: '/cart' }} className="btn btn-primary" style={{ maxWidth: '240px', margin: '1.5rem auto 0' }}>
              Sign In to Continue
            </Link>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="cart-empty-card">
            <span className="empty-cart-icon">🛍️</span>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="btn btn-hero-primary" style={{ maxWidth: '240px', margin: '1.5rem auto 0' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* Cart Items List */}
            <div className="cart-items-column">
              <div className="cart-items-header">
                <span>Items ({cartCount})</span>
                <button
                  className="btn-link-action"
                  onClick={() => navigate('/products')}
                >
                  + Add More Products
                </button>
              </div>

              <div className="cart-items-list">
                {cart.items.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  const itemSubtotal = product.price * item.quantity;

                  return (
                    <div className="cart-item-row" key={product._id}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="cart-item-thumb"
                        onClick={() => navigate(`/products/${product._id}`)}
                        onError={(e) => {
                          e.target.src =
                            'https://placehold.co/120x120/1e293b/94a3b8?text=Product';
                        }}
                      />

                      <div className="cart-item-info">
                        <h3
                          className="cart-item-title"
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          {product.name}
                        </h3>
                        <span className="cart-item-unit-price">
                          Unit Price: {formatPrice(product.price)}
                        </span>
                        <span className="cart-item-stock-hint">
                          {product.stock <= 5
                            ? `Only ${product.stock} in stock`
                            : `In stock (${product.stock})`}
                        </span>

                        <div className="cart-item-controls">
                          {/* Quantity control */}
                          <div className="cart-qty-capsule">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(product._id, item.quantity, -1, product.stock)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="cart-qty-number">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(product._id, item.quantity, 1, product.stock)}
                              disabled={item.quantity >= product.stock}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove button */}
                          <button
                            className="btn-cart-remove"
                            onClick={() => removeFromCart(product._id)}
                            title="Remove item"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-total">
                        <span className="item-total-label">Subtotal</span>
                        <span className="item-total-amount">
                          {formatPrice(itemSubtotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="cart-summary-column">
              <div className="order-summary-card">
                <h2>Order Summary</h2>

                <div className="summary-line">
                  <span>Items Subtotal ({cartCount})</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>

                <div className="summary-line">
                  <span>Estimated Shipping</span>
                  <span className="free-shipping-text">FREE</span>
                </div>

                <div className="summary-line">
                  <span>Standard Taxes</span>
                  <span>Included</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-line total-line">
                  <span>Grand Total</span>
                  <span className="total-amount">{formatPrice(cartSubtotal)}</span>
                </div>

                <p className="summary-savings-note">
                  🎉 You are eligible for <strong>Free Express Shipping</strong>
                </p>

                <button
                  className="btn btn-checkout-action"
                  onClick={() => navigate('/checkout')}
                  id="proceed-to-checkout-btn"
                >
                  Proceed to Checkout ➔
                </button>

                <div className="summary-security-badges">
                  <span>🔒 256-bit SSL Encrypted</span>
                  <span>⚡ Razorpay Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
