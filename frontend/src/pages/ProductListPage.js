import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from '../router/Router';
import { FiSearch, FiSliders, FiX } from '../utils/Icons';
import productAPI from '../api/productAPI';
import ProductCard from '../components/products/ProductCard';
import ProductCardSkeleton from '../components/products/ProductCardSkeleton';
import ProductFilter from '../components/products/ProductFilter';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import useDebounce from '../hooks/useDebounce';
import parseAPIError from '../utils/errorParser';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  const debouncedSearch = useDebounce(search, 400);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12, sort };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (rating) params.rating = rating;

      const data = await productAPI.getAll(params);
      setProducts(data.products || []);
      setTotalResults(data.totalResults || 0);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      setError(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sort, minPrice, maxPrice, rating, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (p) => {
    updateParams('page', String(p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <ErrorState message={error} onRetry={fetchProducts} />
      </div>
    );
  }

  return (
    <div className="container" style={styles.wrapper}>
      <div style={styles.topBar}>
        <div style={styles.searchWrap}>
          <FiSearch size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={search}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.sortWrap}>
          <select
            value={sort}
            onChange={(e) => updateParams('sort', e.target.value)}
            style={styles.sortSelect}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button style={styles.filterToggle} onClick={() => setShowMobileFilter(!showMobileFilter)}>
            <FiSliders size={18} />
          </button>
        </div>
      </div>

      {!loading && (
        <p style={styles.resultsCount}>
          {totalResults} {totalResults === 1 ? 'product' : 'products'} found
        </p>
      )}

      <div style={styles.layout}>
        <aside style={{ ...styles.sidebar, ...(showMobileFilter ? styles.sidebarVisible : {}) }}>
          {showMobileFilter && (
            <button style={styles.closeFilter} onClick={() => setShowMobileFilter(false)}>
              <FiX size={20} />
            </button>
          )}
          <ProductFilter />
        </aside>
        {showMobileFilter && <div style={styles.overlay} onClick={() => setShowMobileFilter(false)} />}

        <div style={styles.main}>
          {loading ? (
            <div style={styles.grid}>
              {[...Array(12)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try adjusting your filters or search terms."
              actionLabel="Clear Filters"
              onAction={() => setSearchParams({})}
            />
          ) : (
            <>
              <div style={styles.grid}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    paddingTop: 'var(--space-8)',
    paddingBottom: 'var(--space-8)',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-4)',
    flexWrap: 'wrap',
  },
  searchWrap: {
    position: 'relative',
    flex: '1 1 300px',
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: 'var(--space-3)',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
    backgroundColor: 'var(--color-bg-card)',
  },
  sortWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  sortSelect: {
    padding: 'var(--space-2) var(--space-4)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
    backgroundColor: 'var(--color-bg-card)',
    cursor: 'pointer',
  },
  filterToggle: {
    display: 'none',
    padding: 'var(--space-2) var(--space-3)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-card)',
  },
  resultsCount: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-4)',
  },
  layout: {
    display: 'flex',
    gap: 'var(--space-6)',
    position: 'relative',
  },
  sidebar: {
    flex: '0 0 260px',
    minWidth: '260px',
  },
  sidebarVisible: {
    display: 'block',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1100,
    overflow: 'auto',
    padding: 'var(--space-4)',
    backgroundColor: 'var(--color-bg-card)',
  },
  overlay: {
    display: 'none',
  },
  closeFilter: {
    float: 'right',
    padding: 'var(--space-2)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 'var(--space-4)',
  },
};

export default ProductListPage;
