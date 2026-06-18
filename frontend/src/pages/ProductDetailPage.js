import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMinus, FiPlus, FiCheck, FiAlertCircle, FiStar, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import productAPI from '../api/productAPI';
import reviewAPI from '../api/reviewAPI';
import useAuth from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import StarRating from '../components/products/StarRating';
import ReviewCard from '../components/products/ReviewCard';
import ErrorState from '../components/common/ErrorState';
import ProductViewer from '../components/3d/ProductViewer';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/formatCurrency';
import parseAPIError from '../utils/errorParser';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [show3D, setShow3D] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productAPI.getBySlug(slug);
        setProduct(data.product);
        if (data.product.images && data.product.images.length > 0) {
          setSelectedImage(0);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/not-found', { replace: true });
          return;
        }
        setError(parseAPIError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  useEffect(() => {
    if (!product) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const data = await reviewAPI.getProductReviews(product._id);
        setReviews(data.reviews || []);
        if (user && data.reviews) {
          setHasReviewed(data.reviews.some((r) => r.user?._id === user.id));
        }
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [product, user]);

  if (loading) {
    return (
      <div className="container" style={styles.skeletonContainer}>
        <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ flex: '1 1 45%', minHeight: '400px', borderRadius: 'var(--radius-lg)' }}></div>
          <div style={{ flex: '1 1 45%' }}>
            <div className="skeleton" style={{ height: '20px', width: '100px', marginBottom: 'var(--space-3)' }}></div>
            <div className="skeleton" style={{ height: '32px', width: '80%', marginBottom: 'var(--space-3)' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '120px', marginBottom: 'var(--space-4)' }}></div>
            <div className="skeleton" style={{ height: '36px', width: '150px', marginBottom: 'var(--space-4)' }}></div>
            <div className="skeleton" style={{ height: '48px', width: '200px', marginBottom: 'var(--space-4)' }}></div>
            <div className="skeleton" style={{ height: '80px', width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [{ url: 'https://picsum.photos/seed/default/600' }];
  const inStock = product.stock > 0;
  const maxQty = Math.min(10, product.stock);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${slug}` } } });
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(parseAPIError(err));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const data = await reviewAPI.create({
        product: product._id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      setReviews((prev) => [data.review, ...prev]);
      setHasReviewed(true);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
      const updated = await productAPI.getBySlug(slug);
      setProduct(updated.product);
    } catch (err) {
      toast.error(parseAPIError(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  const ratingBreakdown = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.round(r.rating);
      if (counts[star] !== undefined) counts[star]++;
    });
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      pct: Math.round((counts[star] / total) * 100),
    }));
  };

  return (
    <div className="container" style={styles.page}>
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>Home</Link>
        <span style={styles.breadcrumbSep}>/</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} style={styles.breadcrumbLink}>
          {product.category}
        </Link>
        <span style={styles.breadcrumbSep}>/</span>
        <span style={styles.breadcrumbCurrent}>{product.name}</span>
      </div>

      <div style={styles.mainLayout}>
        <div style={styles.gallery}>
          <div style={styles.viewToggle}>
            <button
              onClick={() => setShow3D(false)}
              style={{
                ...styles.viewToggleBtn,
                ...(!show3D ? styles.viewToggleBtnActive : {}),
              }}
            >
              <FiStar size={14} /> Photos
            </button>
            <button
              onClick={() => setShow3D(true)}
              style={{
                ...styles.viewToggleBtn,
                ...(show3D ? styles.viewToggleBtnActive : {}),
              }}
            >
              <FiRefreshCw size={14} /> 3D View
            </button>
          </div>
          <AnimatePresence mode="wait">
            {show3D ? (
              <motion.div
                key="3d"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ProductViewer
                  color={product.discountPercent > 0 ? '#FF6B35' : '#4A90D9'}
                  shape={product.category === 'Electronics' ? 'box' : product.category === 'Clothing' ? 'torus' : 'sphere'}
                />
              </motion.div>
            ) : (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div style={styles.mainImageWrap}>
                  <img src={images[selectedImage]?.url} alt={product.name} style={styles.mainImage} />
                </div>
                {images.length > 1 && (
                  <div style={styles.thumbnails}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        style={{
                          ...styles.thumb,
                          ...(idx === selectedImage ? styles.thumbActive : {}),
                        }}
                      >
                        <img src={img.url} alt="" style={styles.thumbImg} />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={styles.info}>
          {product.brand && <p style={styles.brand}>{product.brand}</p>}
          <h1 style={styles.name}>{product.name}</h1>

          <div style={styles.ratingRow}>
            <StarRating rating={product.ratings} size={18} showValue />
            <span style={styles.reviewCount}>({product.numReviews} reviews)</span>
          </div>

          <div style={styles.priceRow}>
            <span style={styles.finalPrice}>{formatINR(product.finalPrice)}</span>
            {product.discountPercent > 0 && (
              <>
                <span style={styles.originalPrice}>{formatINR(product.price)}</span>
                <span style={styles.discountBadge}>-{product.discountPercent}%</span>
              </>
            )}
          </div>

          <div style={styles.stockRow}>
            {inStock ? (
              <span style={styles.inStock}><FiCheck size={16} /> In Stock ({product.stock} left)</span>
            ) : (
              <span style={styles.outOfStock}><FiAlertCircle size={16} /> Out of Stock</span>
            )}
          </div>

          {inStock && (
            <div style={styles.quantityRow}>
              <span style={styles.quantityLabel}>Quantity:</span>
              <div style={styles.quantityControls}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={styles.qtyBtn}
                >
                  <FiMinus size={16} />
                </button>
                <span style={styles.qtyValue}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  disabled={quantity >= maxQty}
                  style={styles.qtyBtn}
                >
                  <FiPlus size={16} />
                </button>
              </div>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleAddToCart}
            disabled={!inStock || addingToCart}
            style={styles.addCartBtn}
          >
            {addingToCart ? (
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
            ) : (
              <><FiShoppingCart size={20} /> {isAuthenticated ? 'Add to Cart' : 'Log in to Buy'}</>
            )}
          </button>

          <div style={styles.description}>
            <h3 style={styles.descTitle}>Description</h3>
            <p style={styles.descText}>{product.description}</p>
          </div>

          <p style={styles.sellerInfo}>
            Sold by: <Link to={`/seller/${product.seller?._id}`} style={styles.sellerLink}>
              {product.seller?.name || 'Unknown'}
            </Link>
          </p>
        </div>
      </div>

      <div style={styles.reviewsSection}>
        <h2 style={styles.reviewsTitle}>Customer Reviews</h2>

        {reviews.length > 0 && (
          <div style={styles.ratingSummary}>
            <div style={styles.ratingBig}>
              <span style={styles.ratingBigValue}>{product.ratings}</span>
              <StarRating rating={product.ratings} size={20} />
              <span style={styles.ratingBigCount}>{product.numReviews} reviews</span>
            </div>
            <div style={styles.ratingBars}>
              {ratingBreakdown().map(({ star, count, pct }) => (
                <div key={star} style={styles.ratingBarRow}>
                  <span style={styles.ratingBarLabel}>{star} ★</span>
                  <div style={styles.ratingBarTrack}>
                    <div style={{ ...styles.ratingBarFill, width: `${pct}%` }}></div>
                  </div>
                  <span style={styles.ratingBarCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviewsLoading ? (
          <div className="page-loader"><div className="spinner"></div></div>
        ) : (
          <div style={styles.reviewsList}>
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}

        {isAuthenticated && !hasReviewed && (
          <div style={styles.reviewFormSection}>
            <h3 style={styles.descTitle}>Write a Review</h3>
            <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
              <div style={styles.reviewRatingPicker}>
                <span style={styles.reviewLabel}>Rating:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      style={styles.starBtn}
                    >
                      <FiStar
                        size={24}
                        fill={star <= reviewForm.rating ? 'var(--color-warning)' : 'none'}
                        color={star <= reviewForm.rating ? 'var(--color-warning)' : 'var(--color-border)'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.field}>
                <input
                  type="text"
                  placeholder="Review title"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <textarea
                  placeholder="Write your review..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  rows={4}
                  style={styles.textarea}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={submittingReview} style={styles.submitBtn}>
                {submittingReview ? (
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                ) : (
                  'Submit Review'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  skeletonContainer: {
    padding: 'var(--space-8) 0',
  },
  page: {
    paddingTop: 'var(--space-6)',
    paddingBottom: 'var(--space-12)',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-6)',
    flexWrap: 'wrap',
  },
  breadcrumbLink: {
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
  },
  breadcrumbSep: {
    color: 'var(--color-text-muted)',
  },
  breadcrumbCurrent: {
    color: 'var(--color-text-primary)',
    fontWeight: 500,
  },
  mainLayout: {
    display: 'flex',
    gap: 'var(--space-8)',
    marginBottom: 'var(--space-12)',
    flexWrap: 'wrap',
  },
  gallery: {
    flex: '1 1 50%',
    minWidth: '300px',
  },
  viewToggle: {
    display: 'flex',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-3)',
  },
  viewToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-1) var(--space-4)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    background: 'var(--glass-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  viewToggleBtnActive: {
    background: 'rgba(255, 107, 53, 0.12)',
    borderColor: 'rgba(255, 107, 53, 0.3)',
    color: 'var(--color-primary)',
  },
  mainImageWrap: {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-border-light)',
    marginBottom: 'var(--space-3)',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbnails: {
    display: 'flex',
    gap: 'var(--space-2)',
    overflowX: 'auto',
  },
  thumb: {
    width: '72px',
    height: '72px',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '2px solid transparent',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  },
  thumbActive: {
    borderColor: 'var(--color-primary)',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    flex: '1 1 45%',
    minWidth: '300px',
  },
  brand: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 'var(--space-2)',
    fontWeight: 500,
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-3)',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-4)',
  },
  reviewCount: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  finalPrice: {
    fontSize: 'var(--text-3xl)',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    color: 'var(--color-text-primary)',
  },
  originalPrice: {
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-muted)',
    textDecoration: 'line-through',
  },
  discountBadge: {
    display: 'inline-block',
    backgroundColor: '#FEF2F2',
    color: 'var(--color-error)',
    fontSize: 'var(--text-sm)',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
  },
  stockRow: {
    marginBottom: 'var(--space-4)',
  },
  inStock: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    color: 'var(--color-success)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
  },
  outOfStock: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    color: 'var(--color-error)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
  },
  quantityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-6)',
  },
  quantityLabel: {
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  qtyBtn: {
    padding: 'var(--space-2) var(--space-3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    border: 'none',
    background: 'none',
  },
  qtyValue: {
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--text-base)',
    fontWeight: 600,
    minWidth: '40px',
    textAlign: 'center',
    borderLeft: '1px solid var(--color-border)',
    borderRight: '1px solid var(--color-border)',
  },
  addCartBtn: {
    width: '100%',
    padding: 'var(--space-3)',
    fontSize: 'var(--text-base)',
    marginBottom: 'var(--space-6)',
    minHeight: '48px',
  },
  description: {
    marginBottom: 'var(--space-4)',
  },
  descTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-base)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-2)',
  },
  descText: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
  },
  sellerInfo: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
  },
  sellerLink: {
    color: 'var(--color-primary)',
    fontWeight: 600,
    textDecoration: 'none',
  },
  reviewsSection: {
    borderTop: '1px solid var(--color-border)',
    paddingTop: 'var(--space-8)',
  },
  reviewsTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 600,
    marginBottom: 'var(--space-6)',
  },
  ratingSummary: {
    display: 'flex',
    gap: 'var(--space-8)',
    marginBottom: 'var(--space-8)',
    padding: 'var(--space-6)',
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    flexWrap: 'wrap',
  },
  ratingBig: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-2)',
    minWidth: '140px',
  },
  ratingBigValue: {
    fontSize: 'var(--text-4xl)',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    color: 'var(--color-text-primary)',
  },
  ratingBigCount: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
  ratingBars: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    justifyContent: 'center',
  },
  ratingBarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  ratingBarLabel: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    width: '40px',
  },
  ratingBarTrack: {
    flex: 1,
    height: '8px',
    backgroundColor: 'var(--color-border-light)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: 'var(--color-warning)',
    borderRadius: 'var(--radius-full)',
    transition: 'width var(--transition-base)',
  },
  ratingBarCount: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    width: '30px',
    textAlign: 'right',
  },
  reviewsList: {
    marginBottom: 'var(--space-8)',
  },
  reviewFormSection: {
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-card)',
  },
  reviewForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    marginTop: 'var(--space-4)',
  },
  reviewRatingPicker: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  reviewLabel: {
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  starBtn: {
    cursor: 'pointer',
    padding: '2px',
    border: 'none',
    background: 'none',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: 'var(--space-3) var(--space-4)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
  },
  textarea: {
    padding: 'var(--space-3) var(--space-4)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  submitBtn: {
    alignSelf: 'flex-start',
    padding: 'var(--space-3) var(--space-8)',
    minHeight: '44px',
  },
};

export default ProductDetailPage;
