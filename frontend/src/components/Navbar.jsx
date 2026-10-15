import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const navigate = useNavigate();
  const { customer, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const customerName = customer?.fullName || customer?.name;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <svg
            className="brand-icon"
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
          <span className="brand-name">ShopKart</span>
        </Link>

        {/* Search input in header */}
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <svg
            className="navbar-search-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search products, brands and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Nav Links */}
        <div className={`navbar-right ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link
            to="/"
            className="btn btn-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            to="/products"
            className="btn btn-nav-link"
            id="nav-products"
            onClick={() => setMobileMenuOpen(false)}
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
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Products</span>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="btn btn-nav-link wishlist-nav-btn"
            id="nav-wishlist"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>❤️</span>
            <span>Wishlist</span>
          </Link>

          {/* Cart Icon with Dynamic Count Badge */}
          <Link
            to="/cart"
            className="btn btn-nav-link cart-nav-btn"
            id="nav-cart"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="cart-icon-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: '18px', height: '18px' }}
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </span>
            <span>Cart</span>
          </Link>

          {/* Authenticated user menu vs Guest controls */}
          {isAuthenticated && customer ? (
            <div className="navbar-user-cluster">
              <Link
                to="/orders"
                className="btn btn-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Orders
              </Link>

              <Link
                to="/account"
                className="navbar-user"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="navbar-avatar">
                  {customerName ? customerName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="navbar-username">{customerName}</span>
              </Link>

              <button
                className="btn btn-logout"
                onClick={handleLogout}
                disabled={loggingOut}
                id="logout-btn"
              >
                {loggingOut ? (
                  <span className="btn-loading">
                    <span className="spinner spinner-sm"></span>
                  </span>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="navbar-guest-cluster">
              <Link
                to="/login"
                className="btn btn-nav-login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-nav-register"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;