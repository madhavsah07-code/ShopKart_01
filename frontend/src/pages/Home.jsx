import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Home() {
  const navigate = useNavigate();
  const { customer, isAuthenticated, loading: authLoading } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchRecent = async () => {
        try {
          setOrdersLoading(true);
          const data = await getMyOrders();
          setRecentOrders((data?.orders || []).slice(0, 3));
        } catch {
          // Non-critical, recent orders fallback
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchRecent();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const createdDate = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Member';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  return (
    <div className="page-wrapper home-page">
      <Navbar />

      <main className="home-main">
        <div className="home-container">
          {/* Welcome Header */}
          <section className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-avatar">
                <span>{customer?.fullName?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="welcome-text">
                <h1>
                  Welcome back, <span className="gradient-text">{customer?.fullName}</span>
                </h1>
                <p>Manage your account profile, orders, and shopping preferences</p>
              </div>
            </div>
          </section>

          {/* Quick Action Navigation Grid */}
          <section className="account-quick-actions-section">
            <h2 className="section-subtitle">Quick Access</h2>
            <div className="account-quick-grid">
              <Link to="/products" className="account-action-card">
                <span className="action-icon">🛍️</span>
                <div className="action-text">
                  <h3>Shop Products</h3>
                  <p>Browse our catalog and special offers</p>
                </div>
                <span className="action-arrow">➔</span>
              </Link>

              <Link to="/cart" className="account-action-card">
                <span className="action-icon">🛒</span>
                <div className="action-text">
                  <h3>Shopping Cart</h3>
                  <p>View items ready for checkout</p>
                </div>
                <span className="action-arrow">➔</span>
              </Link>

              <Link to="/wishlist" className="account-action-card">
                <span className="action-icon">❤️</span>
                <div className="action-text">
                  <h3>My Wishlist</h3>
                  <p>Saved favorites for later</p>
                </div>
                <span className="action-arrow">➔</span>
              </Link>

              <Link to="/orders" className="account-action-card">
                <span className="action-icon">📦</span>
                <div className="action-text">
                  <h3>My Orders</h3>
                  <p>Track packages and review purchases</p>
                </div>
                <span className="action-arrow">➔</span>
              </Link>
            </div>
          </section>

          {/* Customer Profile Cards Grid */}
          <section className="profile-section">
            <h2 className="section-subtitle">Profile Information</h2>
            <div className="profile-grid">
              <div className="profile-card">
                <div className="card-icon card-icon-user">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="card-content">
                  <span className="card-label">Full Name</span>
                  <span className="card-value">{customer?.fullName}</span>
                </div>
              </div>

              <div className="profile-card">
                <div className="card-icon card-icon-email">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div className="card-content">
                  <span className="card-label">Email Address</span>
                  <span className="card-value">{customer?.email}</span>
                </div>
              </div>

              <div className="profile-card">
                <div className="card-icon card-icon-phone">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="card-content">
                  <span className="card-label">Phone Number</span>
                  <span className="card-value">{customer?.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="profile-card">
                <div className="card-icon card-icon-calendar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="card-content">
                  <span className="card-label">Member Since</span>
                  <span className="card-value">{createdDate}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Orders Section */}
          <section className="account-recent-orders-section">
            <div className="section-header-compact">
              <h2 className="section-subtitle">Recent Orders</h2>
              <Link to="/orders" className="view-all-link">
                View All Orders →
              </Link>
            </div>

            {ordersLoading ? (
              <div className="compact-loading">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="compact-empty-orders">
                <p>No recent orders found.</p>
                <Link to="/products" className="btn btn-hero-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="recent-orders-table">
                {recentOrders.map((ord) => (
                  <div
                    key={ord._id}
                    className="recent-order-row"
                    onClick={() => navigate(`/orders/${ord._id}`)}
                  >
                    <div className="recent-order-id">
                      <strong>#{ord._id.slice(-8)}</strong>
                      <span className="recent-order-items">
                        {ord.items?.length} item{ord.items?.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="recent-order-date">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>

                    <div className="recent-order-amount">
                      {formatPrice(ord.totalAmount)}
                    </div>

                    <span
                      className={`badge badge-${
                        ord.paymentStatus === 'paid' ? 'paid' : 'pending'
                      }`}
                    >
                      {ord.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                    </span>

                    <span className="recent-order-arrow">➔</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
