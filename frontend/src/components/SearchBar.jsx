function SearchBar({ search, onSearchChange, category, onCategoryChange, sort, onSortChange }) {
  const categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

  return (
    <div className="search-bar" id="search-bar">
      <div className="search-input-wrapper">
        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
          id="search-input"
        />
        {search && (
          <button
            className="search-clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className="search-filters">
        <div className="filter-select-wrapper">
          <svg className="filter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
            id="category-filter"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-wrapper">
          <svg className="filter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-select"
            id="sort-filter"
          >
            <option value="">Newest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
