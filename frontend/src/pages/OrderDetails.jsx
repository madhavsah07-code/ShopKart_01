import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch (err) {
        console.error('Failed to load order details:', err);
        setError(err.response?.data?.message || 'Could not find this order.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-wrapper order-details-page-wrapper">
      <Navbar />

      <main className="order-details-main container">
        <button
          className="btn-back"
          onClick={() => navigate('/orders')}
        >
          ← Back to Orders
        </button>

        {loading ? (
          <div className="products-state">
            <div className="spinner"></div>
            <p>Loading order details...</p>
          </div>
        ) : error || !order ? (
          <div className="products-state products-state-error">
            <p>{error || 'Order not found'}</p>
            <Link to="/orders" className="btn btn-retry">
              Return to Orders
            </Link>
          </div>
        ) : (
          <div className="order-details-layout">
            <div className="order-details-card">
              <div className="order-details-top">
                <div>
                  <span className="order-label-tag">Order Details</span>
                  <h2>Order #{order._id}</h2>
                  <span className="order-date-text">
                    Placed on {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="order-badges-wrap">
                  <span
                    className={`badge badge-${
                      order.paymentStatus === 'paid' ? 'paid' : 'pending'
                    }`}
                  >
                    {order.paymentStatus === 'paid' ? 'PAID & VERIFIED' : 'PENDING'}
                  </span>
                  <span className="badge badge-processing">
                    {order.orderStatus ? order.orderStatus.toUpperCase() : 'PROCESSING'}
                  </span>
                </div>
              </div>

              <div className="summary-divider"></div>

              <h3>Purchased Products</h3>
              <div className="order-items-table">
                {order.items.map((item, idx) => (
                  <div className="order-table-row" key={idx}>
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src =
                          'https://placehold.co/80x80/1e293b/94a3b8?text=Product';
                      }}
                    />
                    <div className="table-item-info">
                      <h4>{item.name}</h4>
                      <span>Unit Price: {formatPrice(item.price)}</span>
                    </div>
                    <div className="table-item-qty">Qty: {item.quantity}</div>
                    <div className="table-item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="order-financials">
                <div className="fin-line">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="fin-line">
                  <span>Express Delivery</span>
                  <span className="free-shipping-text">FREE</span>
                </div>
                <div className="fin-line grand-total">
                  <span>Total Amount Paid</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Sidebar with Shipping & Payment info */}
            <div className="order-sidebar-card">
              <div className="sidebar-section">
                <h3>Delivery Address</h3>
                <div className="address-display">
                  <strong>{order.shippingAddress?.fullName}</strong>
                  <p>{order.shippingAddress?.address}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                    {order.shippingAddress?.pincode}
                  </p>
                  <p className="phone-line">📞 {order.shippingAddress?.phone}</p>
                </div>
              </div>

              <div className="summary-divider"></div>

              <div className="sidebar-section">
                <h3>Payment Details</h3>
                <p>
                  <strong>Gateway:</strong> Razorpay Standard Test
                </p>
                {order.razorpayPaymentId && (
                  <p className="payment-id-code">
                    <strong>Payment ID:</strong> {order.razorpayPaymentId}
                  </p>
                )}
                {order.razorpayOrderId && (
                  <p className="payment-id-code">
                    <strong>Razorpay Order ID:</strong> {order.razorpayOrderId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
