import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('');
  const [stockOnly, setStockOnly] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    setSearch(urlSearch);
    setCategory(urlCategory);
  }, [searchParams]);

  // Fetch products from backend
  const fetchProducts = useCallback(async (searchTerm, categoryFilter, sortOption) => {
    try {
      setLoading(true);
      setError(null);
      // Map sortOption for backend (only price_asc / price_desc supported on backend)
      const backendSort = sortOption === 'price_asc' || sortOption === 'price_desc' ? sortOption : '';
      const data = await getAllProducts({
        search: searchTerm,
        category: categoryFilter,
        sort: backendSort,
      });
      setProducts(data.products || []);
    } catch {
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(search, category, sort);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, category, sort, fetchProducts]);

  // Extract unique categories from loaded products
  const availableCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  // Apply client-side filters / sorts if needed (like stock filter or alphabetical name sorting)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (stockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    if (sort === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name_desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [products, stockOnly, sort]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
    setStockOnly(false);
    setSearchParams({});
  };

  return (
    <div className="page-wrapper products-page-wrapper">
      <Navbar />

      <main className="products-main">
        <div className="products-container">
          {/* Header */}
          <section className="products-header">
            <div className="products-header-content">
              <h1>
                All <span className="gradient-text">Products</span>
              </h1>
              <p>
                Browse through genuine customer-tested products with live inventory availability and best INR prices.
              </p>
            </div>
          </section>

          {/* Search, Categories, Sort */}
          <SearchBar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              if (!val) {
                searchParams.delete('search');
                setSearchParams(searchParams);
              }
            }}
            category={category}
            onCategoryChange={(val) => {
              setCategory(val);
              if (val) {
                setSearchParams({ ...Object.fromEntries(searchParams), category: val });
              } else {
                searchParams.delete('category');
                setSearchParams(searchParams);
              }
            }}
            sort={sort}
            onSortChange={setSort}
            stockOnly={stockOnly}
            onStockOnlyChange={setStockOnly}
            categories={availableCategories}
          />

          {/* Products Content */}
          <section className="products-content">
            {loading ? (
              <div className="products-state">
                <div className="spinner"></div>
                <p>Finding products for you...</p>
              </div>
            ) : error ? (
              <div className="products-state products-state-error">
                <p>{error}</p>
                <button
                  className="btn btn-retry"
                  onClick={() => fetchProducts(search, category, sort)}
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="products-state products-state-empty">
                <div className="products-state-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: '48px', height: '48px' }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <h3>No products found</h3>
                <p>Try refining your search keyword or clearing the filters.</p>
                {(search || category || sort || stockOnly) && (
                  <button className="btn btn-retry" onClick={handleClearFilters}>
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="products-toolbar-row">
                  <div className="products-count">
                    Showing <span>{filteredProducts.length}</span> product
                    {filteredProducts.length !== 1 ? 's' : ''}
                    {category && ` in "${category}"`}
                    {search && ` matching "${search}"`}
                  </div>

                  {(search || category || sort || stockOnly) && (
                    <button
                      className="btn-clear-inline"
                      onClick={handleClearFilters}
                    >
                      Clear Filters ✕
                    </button>
                  )}
                </div>

                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Products;
