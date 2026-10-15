import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import HeroProductCarousel from '../components/HeroProductCarousel';
import { getAllProducts } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        const prods = data?.products || [];
        setProducts(prods);

        // Extract real unique categories
        const cats = Array.from(
          new Set(prods.map((p) => p.category).filter(Boolean))
        );
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load homepage products:', err);
        setError('Unable to load products right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="page-wrapper home-page-wrapper">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-pill">✨ Premium Shopping Destination</span>
            <h1 className="hero-title">
              Upgrade Your Lifestyle with <span className="highlight-text">ShopKart</span>
            </h1>
            <p className="hero-desc">
              Discover handpicked electronics, premium apparel, and everyday essentials with verified customer reviews, transparent pricing, and express delivery.
            </p>
            <div className="hero-ctas">
              <Link to="/products" className="btn btn-hero-primary">
                Explore All Products ➔
              </Link>
              <Link to="/about" className="btn btn-hero-secondary">
                About ShopKart
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{products.length}+</span>
                <span className="stat-label">Real Products</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Secure Checkout</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">₹0</span>
                <span className="stat-label">Shipping in India</span>
              </div>
            </div>
          </div>

          <HeroProductCarousel
            products={products}
            loading={loading}
            error={error}
          />
        </div>
      </section>

      {/* Benefits Banner */}
      <section className="benefits-section">
        <div className="container benefits-grid">
          <div className="benefit-card">
            <span className="benefit-icon">🚚</span>
            <div>
              <h4>Free Express Delivery</h4>
              <p>On all domestic prepaid & COD orders</p>
            </div>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">🛡️</span>
            <div>
              <h4>Secure Payments</h4>
              <p>Razorpay encrypted 256-bit checkout</p>
            </div>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">🔄</span>
            <div>
              <h4>7-Day Easy Returns</h4>
              <p>Hassle-free replacement policy</p>
            </div>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">💬</span>
            <div>
              <h4>24/7 Dedicated Support</h4>
              <p>Email & ticket support anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Category Section */}
      {categories.length > 0 && (
        <section className="category-section">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">Explore Collections</span>
                <h2 className="section-title">Shop by Category</h2>
              </div>
              <Link to="/products" className="view-all-link">
                View All Categories →
              </Link>
            </div>

            <div className="category-grid">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="category-card"
                  onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
                >
                  <div className="category-avatar">
                    {cat.toLowerCase().includes('elec') ? '💻' :
                     cat.toLowerCase().includes('cloth') || cat.toLowerCase().includes('fash') ? '👕' :
                     cat.toLowerCase().includes('foot') || cat.toLowerCase().includes('shoe') ? '👟' :
                     cat.toLowerCase().includes('book') ? '📚' :
                     cat.toLowerCase().includes('home') ? '🏠' : '📦'}
                  </div>
                  <h3 className="category-name">{cat}</h3>
                  <span className="category-count">
                    {products.filter((p) => p.category === cat).length} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Grid */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Handpicked For You</span>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products" className="view-all-link">
              See All Products ({products.length}) →
            </Link>
          </div>

          {loading ? (
            <div className="products-state">
              <div className="spinner"></div>
              <p>Loading real catalog items...</p>
            </div>
          ) : error ? (
            <div className="products-state products-state-error">
              <p>{error}</p>
              <button
                className="btn btn-retry"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="products-state products-state-empty">
              <p>No products available right now.</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="promo-banner-section">
        <div className="container">
          <div className="promo-banner">
            <div className="promo-content">
              <span className="promo-pill">Limited Time Opportunity</span>
              <h2>Start Shopping with ShopKart Today</h2>
              <p>
                Experience fast checkout with Razorpay, save your favorite picks to wishlist, and track your orders in real time.
              </p>
              <Link to="/products" className="btn btn-promo">
                Browse Full Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
