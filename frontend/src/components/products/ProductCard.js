import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
  const {
    name,
    slug,
    images,
    price,
    finalPrice,
    discountPercent,
    ratings,
    numReviews,
    brand,
    stock,
  } = product;

  const imageUrl = images && images.length > 0 ? images[0].url : 'https://via.placeholder.com/300';

  return (
    <Link to={`/products/${slug}`} style={styles.card}>
      <div style={styles.imageWrap}>
        <img src={imageUrl} alt={name} loading="lazy" style={styles.image} />
        {discountPercent > 0 && (
          <span style={styles.discountBadge}>-{discountPercent}%</span>
        )}
        {stock === 0 && (
          <div style={styles.outOfStock}>
            <span>Out of Stock</span>
          </div>
        )}
        {stock > 0 && stock <= 5 && (
          <span style={styles.lowStock}>Only {stock} left</span>
        )}
        <div style={styles.addCartOverlay}>
          <span style={styles.addCartBtn}>
            <FiShoppingCart size={16} /> Add to Cart
          </span>
        </div>
      </div>
      <div style={styles.content}>
        {brand && <p style={styles.brand}>{brand}</p>}
        <h3 style={styles.name}>{name}</h3>
        <div style={styles.ratingRow}>
          <StarRating rating={ratings} size={14} />
          <span style={styles.reviewCount}>({numReviews})</span>
        </div>
        <div style={styles.priceRow}>
          <span style={styles.finalPrice}>₹{finalPrice}</span>
          {discountPercent > 0 && (
            <span style={styles.originalPrice}>₹{price}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

const styles = {
  card: {
    display: 'block',
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-card)',
    transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    position: 'relative',
  },
  imageWrap: {
    position: 'relative',
    aspectRatio: '1 / 1',
    overflow: 'hidden',
    backgroundColor: 'var(--color-border-light)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform var(--transition-slow)',
  },
  discountBadge: {
    position: 'absolute',
    top: 'var(--space-2)',
    left: 'var(--space-2)',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontSize: 'var(--text-xs)',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
  },
  outOfStock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
  },
  lowStock: {
    position: 'absolute',
    top: 'var(--space-2)',
    right: 'var(--space-2)',
    backgroundColor: 'var(--color-warning)',
    color: '#fff',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
  },
  addCartOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 'var(--space-2)',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
    transform: 'translateY(100%)',
    transition: 'transform var(--transition-base)',
  },
  addCartBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    width: '100%',
    padding: 'var(--space-2)',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
  },
  content: {
    padding: 'var(--space-3) var(--space-4) var(--space-4)',
  },
  brand: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-1)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    lineHeight: 1.4,
    marginBottom: 'var(--space-2)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-3)',
  },
  reviewCount: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  finalPrice: {
    fontSize: 'var(--text-lg)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
  },
  originalPrice: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    textDecoration: 'line-through',
  },
};

export default ProductCard;
