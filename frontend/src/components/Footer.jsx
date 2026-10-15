import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <Link to="/" className="footer-brand">
            <span className="footer-brand-icon">🛒</span>
            <span className="footer-brand-name">ShopKart</span>
          </Link>
          <p className="footer-tagline">
            Your destination for quality curated electronics, fashion, and everyday essentials.
          </p>
          <div className="footer-badges">
            <span className="footer-badge">🔒 100% Secure Checkout</span>
            <span className="footer-badge">⚡ Fast Delivery</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li><Link to="/cart">My Cart</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/orders">Order History</Link></li>
            <li><Link to="/account">My Account</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Payment Methods</h4>
          <p className="footer-payment-info">
            Secured by Razorpay. Accepts UPI, Credit/Debit cards, Net Banking & Wallets in India.
          </p>
          <div className="payment-icons">
            <span className="pay-pill">UPI</span>
            <span className="pay-pill">Cards</span>
            <span className="pay-pill">NetBanking</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ShopKart. All rights reserved.</p>
      </div>
    </footer>
  );
}
