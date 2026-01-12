import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import { ProductCard } from '../components/Product';
import { productsAPI } from '../services/api';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Fetch search results from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => productsAPI.getAll({ search: searchQuery }),
    enabled: !!searchQuery.trim(),
    staleTime: 1000 * 60, // 1 minute
  });

  const results = data?.products || [];

  // Update search when URL changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== searchQuery) {
      setQuery(q);
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(query);
    setSearchParams({ q: query });
  };

  const clearSearch = () => {
    setQuery('');
    setSearchQuery('');
    setSearchParams({});
  };

  const handleSuggestionClick = (tag) => {
    setQuery(tag);
    setSearchQuery(tag);
    setSearchParams({ q: tag });
  };

  const popularSearches = ['Headphones', 'Watch', 'Shoes', 'Electronics', 'Clothing'];

  return (
    <div className="search-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Search</span>
        </nav>

        <div className="search-header">
          <h1>Search Products</h1>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for products, categories..."
                className="search-input"
                autoFocus
              />
              {query && (
                <button type="button" className="search-clear" onClick={clearSearch}>
                  <FiX />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>

        {/* Loading State */}
        {searchQuery && isLoading && (
          <div className="search-loading">
            <FiLoader className="spinner" />
            <p>Searching for "{searchQuery}"...</p>
          </div>
        )}

        {/* Results */}
        {searchQuery && !isLoading && (
          <div className="search-results">
            <p className="search-results-count">
              Found <strong>{results.length}</strong> results for "<strong>{searchQuery}</strong>"
            </p>

            {results.length > 0 ? (
              <div className="search-grid">
                {results.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="search-empty">
                <FiSearch />
                <h2>No products found</h2>
                <p>Try searching with different keywords</p>
                <div className="search-suggestions">
                  <p>Popular searches:</p>
                  <div className="suggestion-tags">
                    {popularSearches.map(tag => (
                      <button key={tag} onClick={() => handleSuggestionClick(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Default State - No Search */}
        {!searchQuery && (
          <div className="search-default">
            <h2>Start Searching</h2>
            <p>Enter a keyword to find products</p>
            <div className="search-suggestions">
              <p>Popular searches:</p>
              <div className="suggestion-tags">
                {popularSearches.map(tag => (
                  <button key={tag} onClick={() => handleSuggestionClick(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
