import React, { useState } from 'react';
import { Link, useNavigate } from '../../router/Router';
import { FiShoppingCart, FiHeart } from '../../utils/Icons';
import useAuth from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import StarRating from './StarRating';
import { useToast } from '../common/Toast';

const ProductCard = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isSeller = user?.role === 'SELLER';
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const showToast = useToast();

  const {
    name, slug, images, price, finalPrice, discountPercent,
    ratings, numReviews, brand, stock,
  } = product;

  const imageUrl = images && images.length > 0 ? images[0].url : 'https://picsum.photos/seed/default/300';

  return (
    <div className="fade-in-up" style={{ perspective: 1000 }}>
      <Link to={`/products/${slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={styles.card}>
          <div style={styles.imageWrap}>
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              style={styles.image}
            />
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
            {!isSeller && (
            <div style={styles.addCartOverlay}>
              <span
                style={styles.addCartBtn}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: { pathname: '/products' } } });
                    return;
                  }
                  if (product.stock === 0) {
                    showToast('Out of stock', 'error');
                    return;
                  }
                  setAdding(true);
                  try {
                    await addToCart(product._id, 1);
                    showToast('Added to cart!', 'success');
                  } catch (err) {
                    showToast('Failed to add to cart', 'error');
                  } finally {
                    setAdding(false);
                  }
                }}
              >
                {adding ? '...' : <><FiShoppingCart size={16} /> Add to Cart</>}
              </span>
            </div>
            )}
            {!isSeller && (
            <button style={styles.wishlistBtn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <FiHeart size={16} />
            </button>
            )}
          </div>
          <div style={styles.content}>
            {brand && <p style={styles.brand}>{brand}</p>}
            <h3 style={styles.name}>{name}</h3>
            <div style={styles.ratingRow}>
              <StarRating rating={ratings} size={13} />
              <span style={styles.reviewCount}>({numReviews})</span>
            </div>
            <div style={styles.priceRow}>
              <span style={styles.finalPrice}>₹{finalPrice}</span>
              {discountPercent > 0 && (
                <span style={styles.originalPrice}>₹{price}</span>
              )}
            </div>
          </div>
          <div style={styles.glow} />
        </div>
      </Link>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
    position: 'relative',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  imageWrap: {
    position: 'relative',
    aspectRatio: '1 / 1',
    overflow: 'hidden',
    backgroundColor: 'var(--color-bg-secondary)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 'var(--space-2)',
    left: 'var(--space-2)',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    color: '#fff',
    fontSize: 'var(--text-xs)',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-mono)',
    boxShadow: '0 2px 10px rgba(255, 107, 53, 0.3)',
  },
  outOfStock: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  lowStock: {
    position: 'absolute',
    top: 'var(--space-2)',
    right: 'var(--space-2)',
    background: 'rgba(245, 158, 11, 0.9)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
  },
  addCartOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 'var(--space-3)',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    transform: 'translateY(100%)',
    transition: 'transform 0.3s',
  },
  addCartBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    width: '100%',
    padding: 'var(--space-2) var(--space-4)',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    color: '#fff',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 'var(--space-2)',
    right: 'var(--space-2)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255,255,255,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    opacity: 0,
  },
  content: {
    padding: 'var(--space-3) var(--space-4) var(--space-4)',
    position: 'relative',
    zIndex: 1,
  },
  brand: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-1)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: 'var(--font-mono)',
  },
  name: {
    fontFamily: 'var(--font-body)',
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
  glow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'var(--radius-lg)',
    background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 107, 53, 0.06), transparent 60%)',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.3s',
    zIndex: 0,
  },
};

export default ProductCard;
