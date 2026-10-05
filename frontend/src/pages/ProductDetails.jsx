import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  getProductById,
  getProfile,
  addToWishlist
} from '../services/api';

import Navbar from '../components/Navbar';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==============================
  // Check Authentication
  // ==============================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getProfile();
        setCustomer(data);
      } catch {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // ==============================
  // Fetch Product Details
  // ==============================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getProductById(id);

        setProduct(data.product);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Product not found.');
        } else if (err.response?.status === 400) {
          setError('Invalid product ID.');
        } else {
          setError(
            'Something went wrong while loading the product.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ==============================
  // Format Price
  // ==============================
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ==============================
  // Get Stock Information
  // ==============================
  const getStockInfo = () => {
    if (!product) return {};

    if (product.stock === 0) {
      return {
        text: 'Out of Stock',
        className: 'stock-out',
        available: false
      };
    } else if (product.stock <= 5) {
      return {
        text: `Only ${product.stock} left — Hurry!`,
        className: 'stock-low',
        available: true
      };
    }

    return {
      text: `${product.stock} units in stock`,
      className: 'stock-in',
      available: true
    };
  };

  const stockInfo = getStockInfo();

  // ==============================
  // Add Product To Wishlist
  // ==============================
  const handleAddToWishlist = async () => {
    try {
      const data = await addToWishlist(product._id);

      console.log(
        'Add to wishlist response:',
        data
      );

      alert('Product added to wishlist ❤️');
    } catch (error) {
      console.error(
        'Add to wishlist error:',
        error
      );

      if (error.response?.status === 409) {
        alert(
          'Product is already in your wishlist'
        );
      } else if (error.response?.status === 401) {
        alert('Please login first');
      } else {
        alert(
          'Failed to add product to wishlist'
        );
      }
    }
  };

  // ==============================
  // Loading State
  // ==============================
  if (loading) {
    return (
      <div className="product-details-page">

        <Navbar
          customerName={customer?.fullName}
        />

        <main className="product-details-main">

          <div className="products-state">

            <div className="products-state-icon">
              <div className="loading-spinner"></div>
            </div>

            <p>
              Loading product details...
            </p>

          </div>

        </main>

      </div>
    );
  }

  // ==============================
  // Error State
  // ==============================
  if (error) {
    return (
      <div className="product-details-page">

        <Navbar
          customerName={customer?.fullName}
        />

        <main className="product-details-main">

          <div className="products-state products-state-error">

            <div className="products-state-icon">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />

                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="12"
                />

                <line
                  x1="12"
                  y1="16"
                  x2="12.01"
                  y2="16"
                />

              </svg>

            </div>

            <p>{error}</p>

            <button
              className="btn btn-retry"
              onClick={() =>
                navigate('/products')
              }
            >
              Back to Products
            </button>

          </div>

        </main>

      </div>
    );
  }

  // ==============================
  // Product Details Page
  // ==============================
  return (
    <div className="product-details-page">

      <Navbar
        customerName={customer?.fullName}
      />

      <main className="product-details-main">

        <div className="product-details-container">

          {/* Back Button */}
          <button
            className="btn-back"
            onClick={() =>
              navigate('/products')
            }
            id="back-to-products"
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

              <line
                x1="19"
                y1="12"
                x2="5"
                y2="12"
              />

              <polyline
                points="12 19 5 12 12 5"
              />

            </svg>

            Back to Products

          </button>


          <div className="product-details-grid">

            {/* ==============================
                Product Image
            ============================== */}

            <div className="product-details-image-section">

              <div className="product-details-image-wrapper">

                <img
                  src={product.image}
                  alt={product.name}
                  className="product-details-image"
                  onError={(e) => {
                    e.target.src =
                      'https://placehold.co/600x500/1e293b/94a3b8?text=No+Image';
                  }}
                />

                <span className="product-details-category-badge">
                  {product.category}
                </span>

              </div>

            </div>


            {/* ==============================
                Product Information
            ============================== */}

            <div className="product-details-info">

              {/* Product Name */}
              <h1 className="product-details-name">
                {product.name}
              </h1>


              {/* Product Price */}
              <div className="product-details-price">
                {formatPrice(product.price)}
              </div>


              {/* Stock Information */}
              <div
                className={`product-details-stock ${stockInfo.className}`}
              >

                <span className="stock-dot"></span>

                {stockInfo.text}

              </div>


              <div className="product-details-divider"></div>


              {/* Description */}
              <div className="product-details-section">

                <h3>
                  Description
                </h3>

                <p className="product-details-description">
                  {product.description}
                </p>

              </div>


              {/* Category */}
              <div className="product-details-section">

                <h3>
                  Category
                </h3>

                <span className="product-details-category-tag">
                  {product.category}
                </span>

              </div>


              <div className="product-details-divider"></div>


              {/* ==============================
                  Add To Cart
              ============================== */}

              <button
                className={`btn btn-add-to-cart ${
                  !stockInfo.available
                    ? 'btn-disabled'
                    : ''
                }`}
                disabled={!stockInfo.available}
                id="add-to-cart-btn"
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

                  <circle
                    cx="8"
                    cy="21"
                    r="1"
                  />

                  <circle
                    cx="19"
                    cy="21"
                    r="1"
                  />

                  <path
                    d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
                  />

                </svg>

                {stockInfo.available
                  ? 'Add to Cart'
                  : 'Out of Stock'}

              </button>


              {/* ==============================
                  Add To Wishlist
              ============================== */}

              <button
                className="btn btn-add-to-wishlist"
                onClick={handleAddToWishlist}
                id="add-to-wishlist-btn"
              >

                ❤️ Add to Wishlist

              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default ProductDetails;