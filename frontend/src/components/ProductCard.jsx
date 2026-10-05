import { useNavigate } from 'react-router-dom';
import { addToWishlist } from '../services/api';

function ProductCard({ product }) {
  const navigate = useNavigate();

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
  // Stock Status
  // ==============================
  const getStockStatus = () => {
    if (product.stock === 0) {
      return {
        text: 'Out of Stock',
        className: 'stock-out',
      };
    }

    if (product.stock <= 5) {
      return {
        text: `Only ${product.stock} left!`,
        className: 'stock-low',
      };
    }

    return {
      text: `${product.stock} units left`,
      className: 'stock-in',
    };
  };

  const stockStatus = getStockStatus();

  return (
    <div
      className="product-card"
      id={`product-card-${product._id}`}
    >

      {/* ==============================
          Product Image
      ============================== */}

      <div className="product-card-image">

        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.target.src =
              'https://placehold.co/400x300/1e293b/94a3b8?text=No+Image';
          }}
        />

        <span className="product-card-category">
          {product.category}
        </span>

        {/* Wishlist Button */}
        <button
          className="wishlist-btn"
          onClick={handleAddToWishlist}
          aria-label="Add to wishlist"
        >
          ❤️
        </button>

      </div>


      {/* ==============================
          Product Information
      ============================== */}

      <div className="product-card-body">

        <h3 className="product-card-name">
          {product.name}
        </h3>

        <div className="product-card-price">
          {formatPrice(product.price)}
        </div>

        <div
          className={`product-card-stock ${stockStatus.className}`}
        >
          <span className="stock-dot"></span>

          {stockStatus.text}
        </div>


        {/* View Details */}
        <button
          className="btn btn-view-details"
          onClick={() =>
            navigate(`/product/${product._id}`)
          }
          id={`view-details-${product._id}`}
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
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

            <circle
              cx="12"
              cy="12"
              r="3"
            />
          </svg>

          View Details

        </button>

      </div>

    </div>
  );
}

export default ProductCard;