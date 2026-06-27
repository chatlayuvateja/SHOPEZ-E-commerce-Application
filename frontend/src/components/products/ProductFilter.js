import React from 'react';
import { useSearchParams } from '../../router/Router';

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Other'];

const ProductFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentRating = searchParams.get('rating') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Filters</h3>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Category</h4>
        <div style={styles.categoryList}>
          <button
            onClick={() => updateParam('category', '')}
            style={{ ...styles.categoryBtn, ...(currentCategory === '' ? styles.categoryBtnActive : {}) }}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              style={{ ...styles.categoryBtn, ...(currentCategory === cat ? styles.categoryBtnActive : {}) }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Price Range</h4>
        <div style={styles.priceRow}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            style={styles.priceInput}
          />
          <span style={styles.priceSep}>-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            style={styles.priceInput}
          />
        </div>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Rating</h4>
        {[4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => updateParam('rating', currentRating === String(star) ? '' : String(star))}
            style={{ ...styles.ratingBtn, ...(currentRating === String(star) ? styles.ratingBtnActive : {}) }}
          >
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: i < star ? 'var(--color-warning)' : 'var(--color-border)', fontSize: '16px' }}>
                ★
              </span>
            ))}
            <span style={styles.ratingLabel}>& up</span>
          </button>
        ))}
      </div>

      <button className="btn-ghost" onClick={() => setSearchParams({})} style={styles.clearBtn}>
        Clear All Filters
      </button>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-card)',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    marginBottom: 'var(--space-6)',
    color: 'var(--color-text-primary)',
  },
  section: {
    marginBottom: 'var(--space-6)',
  },
  sectionTitle: {
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  },
  categoryBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    border: 'none',
    background: 'none',
  },
  categoryBtnActive: {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontWeight: 600,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  priceInput: {
    width: '100%',
    padding: 'var(--space-2) var(--space-3)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
  },
  priceSep: {
    color: 'var(--color-text-muted)',
  },
  ratingBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    width: '100%',
    textAlign: 'left',
    border: 'none',
    background: 'none',
  },
  ratingBtnActive: {
    backgroundColor: 'var(--color-border-light)',
  },
  ratingLabel: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    marginLeft: 'var(--space-1)',
  },
  clearBtn: {
    width: '100%',
    marginTop: 'var(--space-4)',
    justifyContent: 'center',
  },
};

export default ProductFilter;
