import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch (err) {
        console.error('Failed to load confirmed order:', err);
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

  return (
    <div className="page-wrapper order-success-wrapper">
      <Navbar />

      <main className="order-success-main container">
        <div className="order-success-card">
          <div className="checkmark-icon">🎉</div>
          <h1>Payment Successful!</h1>
          <p className="order-success-subtitle">
            Thank you for shopping with ShopKart. Your order has been placed and verified.
          </p>

          <div className="confirmed-order-box">
            <div className="confirmed-row">
              <span className="label">Order Reference ID:</span>
              <span className="value order-id-highlight">{id}</span>
            </div>
            {order && (
              <>
                <div className="confirmed-row">
                  <span className="label">Total Paid:</span>
                  <span className="value">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="confirmed-row">
                  <span className="label">Payment Status:</span>
                  <span className="badge badge-paid">PAID & VERIFIED</span>
                </div>
                <div className="confirmed-row">
                  <span className="label">Delivery To:</span>
                  <span className="value">
                    {order.shippingAddress?.fullName}, {order.shippingAddress?.city} -{' '}
                    {order.shippingAddress?.pincode}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="order-success-actions">
            <Link to={`/orders/${id}`} className="btn btn-primary">
              View Order Details
            </Link>
            <Link to="/orders" className="btn btn-secondary">
              My Order History
            </Link>
            <Link to="/products" className="btn btn-hero-secondary">
              Continue Shopping ➔
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
