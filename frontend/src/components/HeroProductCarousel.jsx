import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function HeroProductCarousel({ products = [], loading = false, error = null }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Take up to 8 real products for the hero carousel showcase
  const carouselItems = products.slice(0, 8);
  const totalItems = carouselItems.length;

  // Next slide handler
  const handleNext = useCallback(() => {
    if (totalItems <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  // Previous slide handler
  const handlePrev = useCallback(() => {
    if (totalItems <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  // Automatic sliding timer (every 3.5 seconds)
  useEffect(() => {
    if (totalItems <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 3500);

    return () => clearInterval(timer);
  }, [totalItems, isPaused, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
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

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="hero-carousel-container">
        <div className="hero-carousel-skeleton">
          <div className="skeleton-img"></div>
          <div className="skeleton-details">
            <div className="skeleton-line-sm"></div>
            <div className="skeleton-line-lg"></div>
            <div className="skeleton-line-md"></div>
            <div className="skeleton-btn"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="hero-carousel-container">
        <div className="hero-carousel-card hero-carousel-empty">
          <span className="empty-icon">⚠️</span>
          <h4>Product Catalog Offline</h4>
          <p>Unable to load featured products right now.</p>
        </div>
      </div>
    );
  }

  // Empty State (No products available in backend)
  if (totalItems === 0) {
    return (
      <div className="hero-carousel-container">
        <div className="hero-carousel-card hero-carousel-empty">
          <span className="empty-icon">📦</span>
          <h4>No Products Available</h4>
          <p>Our catalog is being updated. Please check back soon!</p>
        </div>
      </div>
    );
  }

  const currentProduct = carouselItems[currentIndex] || carouselItems[0];

  return (
    <div
      className="hero-carousel-container"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Products Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      <div className="hero-card-glow"></div>

      <div className="hero-carousel-card">
        {/* Category Badge if real category exists */}
        {currentProduct.category && (
          <span className="hero-carousel-badge">
            {currentProduct.category}
          </span>
        )}

        {/* Carousel Image Wrap */}
        <div
          className="hero-carousel-img-wrap"
          onClick={() => navigate(`/products/${currentProduct._id}`)}
          style={{ cursor: 'pointer' }}
        >
          <img
            key={currentProduct._id}
            src={currentProduct.image}
            alt={currentProduct.name}
            className="hero-carousel-img"
            onError={(e) => {
              e.target.src =
                'https://placehold.co/600x400/1e293b/94a3b8?text=Product+Image';
            }}
          />

          {/* Previous / Next Arrow Controls (only show if multiple items) */}
          {totalItems > 1 && (
            <>
              <button
                type="button"
                className="hero-carousel-nav-btn prev-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous product"
                title="Previous product"
              >
                ‹
              </button>
              <button
                type="button"
                className="hero-carousel-nav-btn next-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next product"
                title="Next product"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Product Details Section */}
        <div className="hero-carousel-details">
          <div className="hero-carousel-meta-row">
            <span className="hero-carousel-price">
              {formatPrice(currentProduct.price)}
            </span>
            <span
              className={`hero-carousel-stock ${
                currentProduct.stock > 0 ? 'stock-in' : 'stock-out'
              }`}
            >
              {currentProduct.stock > 0
                ? currentProduct.stock <= 5
                  ? `Only ${currentProduct.stock} left!`
                  : 'In Stock'
                : 'Out of Stock'}
            </span>
          </div>

          <h3
            className="hero-carousel-title"
            title={currentProduct.name}
            onClick={() => navigate(`/products/${currentProduct._id}`)}
          >
            {currentProduct.name}
          </h3>

          {currentProduct.description && (
            <p className="hero-carousel-desc">
              {currentProduct.description}
            </p>
          )}

          <div className="hero-carousel-action-row">
            <button
              type="button"
              className="btn btn-hero-carousel-cta"
              onClick={() => navigate(`/products/${currentProduct._id}`)}
              id="hero-carousel-view-btn"
            >
              View Product ➔
            </button>

            {/* Pagination Dots (only show if multiple items) */}
            {totalItems > 1 && (
              <div
                className="hero-carousel-dots"
                role="tablist"
                aria-label="Product Slides"
              >
                {carouselItems.map((item, index) => (
                  <button
                    key={item._id}
                    type="button"
                    role="tab"
                    aria-selected={index === currentIndex}
                    aria-label={`Go to slide ${index + 1}: ${item.name}`}
                    className={`hero-carousel-dot ${
                      index === currentIndex ? 'active' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroProductCarousel;
