import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiGrid, FiList, FiFilter, FiX, FiChevronDown, FiLoader } from 'react-icons/fi';
import { ProductCard } from '../components/Product';
import { productsAPI } from '../services/api';
import './Products.css';

const categories = ['All', 'Electronics', 'Clothing', 'Home & Living', 'Sports', 'Beauty', 'Accessories'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // Fetch products from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory, sortBy],
    queryFn: () => productsAPI.getAll({
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : sortBy === 'rating' ? 'rating' : undefined,
      sortOrder: sortBy === 'price-low' ? 'asc' : 'desc',
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const products = data?.products || [];

  // Apply client-side price filter
  const filteredProducts = products.filter(
    p => p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Products</span>
        </nav>

        <div className="products-page__header">
          <h1 className="products-page__title">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h1>
          <p className="products-page__count">
            {isLoading ? 'Loading...' : `${filteredProducts.length} products found`}
          </p>
        </div>

        <div className="products-page__layout">
          {/* Sidebar Filters */}
          <aside className={`products-page__sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters">
              <div className="filters__header">
                <h3>Filters</h3>
                <button className="filters__close" onClick={() => setShowFilters(false)}>
                  <FiX />
                </button>
              </div>

              {/* Categories */}
              <div className="filter-group">
                <h4 className="filter-group__title">Categories</h4>
                <div className="filter-group__options">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`filter-option ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4 className="filter-group__title">Price Range</h4>
                <div className="price-range">
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="price-range__slider"
                  />
                  <div className="price-range__values">
                    <span>Rs. 0</span>
                    <span>Rs. {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="products-page__main">
            {/* Toolbar */}
            <div className="products-toolbar">
              <button
                className="products-toolbar__filter-btn"
                onClick={() => setShowFilters(true)}
              >
                <FiFilter /> Filters
              </button>

              <div className="products-toolbar__right">
                <div className="products-toolbar__sort">
                  <span>Sort by:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <FiChevronDown />
                </div>

                <div className="products-toolbar__view">
                  <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                  >
                    <FiGrid />
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="products-loading">
                <FiLoader className="spinner" />
                <p>Loading products...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="products-error">
                <p>Failed to load products. Please try again.</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && filteredProducts.length > 0 && (
              <div className={`products-grid ${viewMode === 'list' ? 'products-grid--list' : ''}`}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="products-empty">
                <p>No products found matching your criteria.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange([0, 15000]);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
