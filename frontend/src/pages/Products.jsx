import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, getProfile } from '../services/api';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

function Products() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getProfile();
        setCustomer(data);
      } catch {
        navigate('/login');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch products with debounce for search
  const fetchProducts = useCallback(async (searchTerm, categoryFilter, sortOption) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProducts({
        search: searchTerm,
        category: categoryFilter,
        sort: sortOption,
      });
      setProducts(data.products);
    } catch {
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (authLoading) return;

    const timer = setTimeout(() => {
      fetchProducts(search, category, sort);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, sort, fetchProducts, authLoading]);

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <Navbar customerName={customer?.fullName} />
      <main className="products-main">
        <div className="products-container">
          {/* Page Header */}
          <section className="products-header">
            <div className="products-header-content">
              <h1>
                Discover <span className="gradient-text">Products</span>
              </h1>
              <p>Browse our curated collection of premium products</p>
            </div>
          </section>

          {/* Search & Filters */}
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            sort={sort}
            onSortChange={setSort}
          />

          {/* Products Content */}
          <section className="products-content">
            {loading ? (
              <div className="products-state">
                <div className="products-state-icon">
                  <div className="loading-spinner"></div>
                </div>
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className="products-state products-state-error">
                <div className="products-state-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p>{error}</p>
                <button className="btn btn-retry" onClick={() => fetchProducts(search, category, sort)}>
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="products-state products-state-empty">
                <div className="products-state-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <p>No products found.</p>
                {(search || category) && (
                  <button
                    className="btn btn-retry"
                    onClick={() => {
                      setSearch('');
                      setCategory('');
                      setSort('');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="products-count">
                  Showing <span>{products.length}</span> product{products.length !== 1 ? 's' : ''}
                </div>
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Products;
