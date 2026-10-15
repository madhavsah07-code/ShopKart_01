import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart } = useCart();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [cartAddingId, setCartAddingId] = useState(null);

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 3000);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const data = await getWishlist();
        setWishlist(data?.wishlist || []);
      } catch (error) {
        console.error('Get wishlist error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, authLoading]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      showFeedback('Removed from wishlist', 'info');
    } catch {
      showFeedback('Failed to remove item', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    if (product.stock === 0) return;
    setCartAddingId(product._id);
    try {
      await addToCart(product._id, 1);
      showFeedback(`Added "${product.name}" to cart! 🛒`, 'success');
    } catch (err) {
      showFeedback(err.message || 'Failed to add to cart', 'error');
    } finally {
      setCartAddingId(null);
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

  return (
    <div className="page-wrapper wishlist-page-wrapper">
      <Navbar />

      <main className="wishlist-main container">
        <div className="wishlist-header">
          <h1>My Wishlist ❤️</h1>
          <p>Saved items you want to buy later</p>
        </div>

        {feedback.text && (
          <div className={`wishlist-feedback alert-${feedback.type}`}>
            {feedback.text}
          </div>
        )}

        {authLoading || loading ? (
          <div className="products-state">
            <div className="spinner"></div>
            <p>Loading your saved wishlist...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="wishlist-empty-card">
            <span className="empty-icon">🔒</span>
            <h2>Please log in to see your wishlist</h2>
            <p>Your saved favorites are tied to your personal account.</p>
            <Link to="/login" className="btn btn-primary" style={{ maxWidth: '240px', margin: '1rem auto 0' }}>
              Sign In to View
            </Link>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="wishlist-empty-card">
            <span className="empty-icon">💔</span>
            <h2>Your wishlist is empty</h2>
            <p>Explore our catalog and click the heart icon to save items here.</p>
            <Link to="/products" className="btn btn-hero-primary" style={{ maxWidth: '240px', margin: '1.5rem auto 0' }}>
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div className="wishlist-card" key={product._id}>
                <div
                  className="wishlist-img-wrap"
                  onClick={() => navigate(`/products/${product._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src =
                        'https://placehold.co/400x300/1e293b/94a3b8?text=No+Image';
                    }}
                  />
                  {product.category && (
                    <span className="wishlist-badge">{product.category}</span>
                  )}
                </div>

                <div className="wishlist-card-body">
                  <h3
                    onClick={() => navigate(`/products/${product._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {product.name}
                  </h3>

                  <div className="wishlist-price">{formatPrice(product.price)}</div>

                  <p className={`stock-status ${product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </p>

                  <div className="wishlist-actions">
                    <button
                      className="btn btn-wishlist-cart"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0 || cartAddingId === product._id}
                    >
                      {cartAddingId === product._id
                        ? 'Adding...'
                        : product.stock === 0
                        ? 'Out of Stock'
                        : 'Move to Cart 🛒'}
                    </button>

                    <button
                      className="btn btn-wishlist-remove"
                      onClick={() => handleRemove(product._id)}
                      title="Remove from wishlist"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Wishlist;