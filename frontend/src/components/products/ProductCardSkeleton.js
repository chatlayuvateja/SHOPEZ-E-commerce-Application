import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div style={styles.card}>
      <div style={styles.imageWrap}>
        <div className="skeleton" style={styles.image}></div>
      </div>
      <div style={styles.content}>
        <div className="skeleton" style={styles.brand}></div>
        <div className="skeleton" style={styles.name}></div>
        <div className="skeleton" style={styles.rating}></div>
        <div className="skeleton" style={styles.price}></div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-card)',
  },
  imageWrap: {
    aspectRatio: '1 / 1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 'var(--space-3) var(--space-4) var(--space-4)',
  },
  brand: {
    height: '12px',
    width: '60px',
    marginBottom: 'var(--space-2)',
  },
  name: {
    height: '32px',
    width: '100%',
    marginBottom: 'var(--space-2)',
  },
  rating: {
    height: '14px',
    width: '100px',
    marginBottom: 'var(--space-3)',
  },
  price: {
    height: '24px',
    width: '80px',
  },
};

export default ProductCardSkeleton;
