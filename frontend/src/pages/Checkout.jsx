import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createPaymentOrder, verifyPayment } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Checkout() {
  const navigate = useNavigate();
  const { customer } = useAuth();
  const { cart, cartCount, cartSubtotal, clearCart } = useCart();

  const [form, setForm] = useState({
    fullName: customer?.fullName || customer?.name || '',
    phone: customer?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart?.items || cart.items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cart, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!form.address.trim()) errs.address = 'Street address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      errs.pincode = 'Pincode must be exactly 6 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      // 1. Ask backend to validate cart, stock & create payment order
      const orderData = await createPaymentOrder({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      });

      const { orderId, razorpayOrderId, keyId, amount, currency, isSimulated } = orderData;

      // 2. Razorpay Standard Checkout in Test Mode
      if (
        typeof window !== 'undefined' &&
        window.Razorpay &&
        keyId &&
        keyId !== 'your_test_key_id' &&
        keyId !== 'rzp_test_placeholder' &&
        !isSimulated
      ) {
        const options = {
          key: keyId,
          amount: Math.round(amount * 100),
          currency: currency || 'INR',
          name: 'ShopKart',
          description: `Order #${orderId.slice(-6)}`,
          order_id: razorpayOrderId,
          prefill: {
            name: form.fullName,
            contact: form.phone,
            email: customer?.email || '',
          },
          theme: {
            color: '#657166',
          },
          handler: async function (response) {
            try {
              // 3. Send payment callback to backend for verification
              const verifyRes = await verifyPayment({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                // Clear cart only after verified payment
                await clearCart();
                navigate(`/order-success/${orderId}`);
              }
            } catch (vErr) {
              setGeneralError(vErr.response?.data?.message || 'Payment verification failed.');
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setGeneralError(resp.error?.description || 'Payment was declined.');
          setSubmitting(false);
        });
        rzp.open();
      } else {
        // Safe Razorpay Test Mode Simulation (handles environment when user has not yet entered Razorpay API keys)
        const simPaymentId = `pay_sim_${Date.now()}`;
        const simSignature = 'simulated_test_signature';

        const verifyRes = await verifyPayment({
          orderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: simPaymentId,
          razorpay_signature: simSignature,
        });

        if (verifyRes.success) {
          await clearCart();
          navigate(`/order-success/${orderId}`);
        } else {
          setGeneralError('Simulation payment verification failed.');
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setGeneralError(
        err.response?.data?.message || err.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper checkout-page-wrapper">
      <Navbar />

      <main className="checkout-main container">
        <div className="checkout-header">
          <h1>Express Checkout</h1>
          <p>Please enter your shipping address to finalize your order</p>
        </div>

        {generalError && (
          <div className="checkout-error-alert alert-error">
            <span>⚠️ {generalError}</span>
          </div>
        )}

        <form className="checkout-grid" onSubmit={handlePlaceOrder}>
          {/* Shipping Form Column */}
          <div className="shipping-form-card">
            <h2>Shipping Address (India)</h2>

            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <div className={`input-wrapper ${errors.fullName ? 'has-error' : ''}`}>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number (10 digits) *</label>
              <div className={`input-wrapper ${errors.phone ? 'has-error' : ''}`}>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Street Address / House / Flat *</label>
              <div className={`input-wrapper ${errors.address ? 'has-error' : ''}`}>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="House number, Street, Landmark"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <div className={`input-wrapper ${errors.city ? 'has-error' : ''}`}>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="state">State *</label>
                <div className={`input-wrapper ${errors.state ? 'has-error' : ''}`}>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    placeholder="e.g. Maharashtra"
                    value={form.state}
                    onChange={handleChange}
                  />
                </div>
                {errors.state && <span className="field-error">{errors.state}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode (6 digits) *</label>
              <div className={`input-wrapper ${errors.pincode ? 'has-error' : ''}`}>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  placeholder="e.g. 400001"
                  maxLength={6}
                  value={form.pincode}
                  onChange={handleChange}
                />
              </div>
              {errors.pincode && <span className="field-error">{errors.pincode}</span>}
            </div>
          </div>

          {/* Cart Review & Payment Summary Column */}
          <div className="checkout-summary-card">
            <h2>Order Review ({cartCount} items)</h2>

            <div className="checkout-items-preview">
              {cart.items.map((item) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <div className="checkout-item-row" key={product._id}>
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src =
                          'https://placehold.co/80x80/1e293b/94a3b8?text=Item';
                      }}
                    />
                    <div className="item-info">
                      <span className="item-title">{product.name}</span>
                      <span className="item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="item-price">
                      {formatPrice(product.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>

            <div className="summary-line">
              <span>Express Delivery</span>
              <span className="free-shipping-text">FREE</span>
            </div>

            <div className="summary-line total-line">
              <span>Payable Total</span>
              <span className="total-amount">{formatPrice(cartSubtotal)}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-pay-now"
              disabled={submitting}
              id="place-order-btn"
            >
              {submitting ? (
                <span className="btn-loading">
                  <span className="spinner spinner-sm"></span> Processing Secure Payment...
                </span>
              ) : (
                `Pay ${formatPrice(cartSubtotal)} with Razorpay`
              )}
            </button>

            <div className="checkout-guarantee">
              <span>🔒 100% Encrypted Payment</span>
              <span>• Razorpay Test Mode Compliant</span>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
