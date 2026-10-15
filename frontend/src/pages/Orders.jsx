import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyOrders } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyOrders();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError('Failed to fetch your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-wrapper orders-page-wrapper">
      <Navbar />

      <main className="orders-main container">
        <div className="orders-header">
          <h1>My Orders ({orders.length})</h1>
          <p>Track shipments and view receipts of your previous purchases</p>
        </div>

        {loading ? (
          <div className="products-state">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
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
        ) : orders.length === 0 ? (
          <div className="orders-empty-card">
            <span className="empty-icon">📦</span>
            <h2>No orders placed yet</h2>
            <p>You haven't purchased anything yet. Explore our latest products today!</p>
            <Link
              to="/products"
              className="btn btn-hero-primary"
              style={{ maxWidth: '240px', margin: '1.5rem auto 0' }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-history-card" key={order._id}>
                <div className="order-history-header">
                  <div className="order-meta-group">
                    <span className="meta-label">Order ID</span>
                    <span className="order-id-code">#{order._id}</span>
                  </div>
                  <div className="order-meta-group">
                    <span className="meta-label">Placed On</span>
                    <span className="meta-value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-meta-group">
                    <span className="meta-label">Total Amount</span>
                    <span className="order-amount-bold">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                  <div className="order-status-group">
                    <span
                      className={`badge badge-${
                        order.paymentStatus === 'paid' ? 'paid' : 'pending'
                      }`}
                    >
                      {order.paymentStatus === 'paid' ? 'PAID' : 'PAYMENT PENDING'}
                    </span>
                    <span className="badge badge-processing">
                      {order.orderStatus ? order.orderStatus.toUpperCase() : 'PROCESSING'}
                    </span>
                  </div>
                </div>

                <div className="order-history-items">
                  {order.items.map((item, idx) => (
                    <div className="order-item-inline" key={idx}>
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src =
                            'https://placehold.co/80x80/1e293b/94a3b8?text=Product';
                        }}
                      />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <span className="item-meta">
                          Qty: {item.quantity} • {formatPrice(item.price)} each
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-history-footer">
                  <div className="order-delivery-hint">
                    📍 Ships to: <strong>{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.city}, {order.shippingAddress?.state})
                  </div>
                  <button
                    className="btn btn-view-order-details"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    View Order Details ➔
                  </button>
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
