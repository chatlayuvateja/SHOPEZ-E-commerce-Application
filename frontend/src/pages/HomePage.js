import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronRight, FiPackage, FiTruck, FiShield } from 'react-icons/fi';
import useFetch from '../hooks/useFetch';
import productAPI from '../api/productAPI';
import ProductCard from '../components/products/ProductCard';
import ProductCardSkeleton from '../components/products/ProductCardSkeleton';

const CATEGORIES = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Clothing', icon: '👕' },
  { name: 'Home & Kitchen', icon: '🏠' },
  { name: 'Books', icon: '📚' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Toys', icon: '🧸' },
  { name: 'Automotive', icon: '🚗' },
  { name: 'Other', icon: '📦' },
];

const HomePage = () => {
  const { data: featuredData, isLoading: loadingFeatured } = useFetch(
    (signal) => productAPI.getFeatured(signal),
    []
  );
  const { data: categoriesData, isLoading: loadingCategories } = useFetch(
    (signal) => productAPI.getCategories(signal),
    []
  );

  const featured = featuredData?.products || [];
  const categories = categoriesData?.categories || [];

  return (
    <div>
      <section style={styles.hero}>
        <div className="container" style={styles.heroInner}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Shop Everything.<br />
              <span style={styles.heroAccent}>Find Anything.</span>
            </h1>
            <p style={styles.heroSub}>
              Discover millions of products from trusted sellers at unbeatable prices. 
              Free delivery on orders over ₹999.
            </p>
            <div style={styles.heroCtas}>
              <Link to="/products" className="btn-primary" style={styles.heroBtn}>
                Shop Now <FiArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-ghost" style={styles.heroBtn}>
                Become a Seller
              </Link>
            </div>
            <div style={styles.heroFeatures}>
              <div style={styles.heroFeature}><FiTruck size={18} /> Free Delivery</div>
              <div style={styles.heroFeature}><FiShield size={18} /> Secure Payments</div>
              <div style={styles.heroFeature}><FiPackage size={18} /> Easy Returns</div>
            </div>
          </div>
          <div style={styles.heroVisual}>
            <div style={styles.heroShapeLarge}></div>
            <div style={styles.heroShapeMedium}></div>
            <div style={styles.heroShapeSmall}></div>
          </div>
        </div>
      </section>

      <section className="container" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Shop by Category</h2>
          <Link to="/products" style={styles.viewAll}>
            View All <FiChevronRight size={16} />
          </Link>
        </div>
        <div style={styles.categoriesRow}>
          {loadingCategories
            ? [...Array(9)].map((_, i) => (
                <div key={i} className="skeleton" style={styles.categorySkeleton}></div>
              ))
            : CATEGORIES.map((cat) => {
                const dbCat = categories.find((c) => c.category === cat.name);
                return (
                  <Link
                    key={cat.name}
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    style={styles.categoryChip}
                  >
                    <span style={styles.categoryIcon}>{cat.icon}</span>
                    <span style={styles.categoryName}>{cat.name}</span>
                    {dbCat && <span style={styles.categoryCount}>({dbCat.count})</span>}
                  </Link>
                );
              })
          }
        </div>
      </section>

      <section className="container" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured Products</h2>
          <Link to="/products?featured=true" style={styles.viewAll}>
            View All <FiChevronRight size={16} />
          </Link>
        </div>
        <div style={styles.carousel}>
          {loadingFeatured
            ? [...Array(4)].map((_, i) => (
                <div key={i} style={{ minWidth: '280px', flex: '0 0 auto' }}>
                  <ProductCardSkeleton />
                </div>
              ))
            : featured.map((product) => (
                <div key={product._id} style={{ minWidth: '280px', flex: '0 0 auto' }}>
                  <ProductCard product={product} />
                </div>
              ))
          }
        </div>
      </section>

      <section style={styles.promoBanner}>
        <div className="container" style={styles.promoInner}>
          <div style={styles.promoContent}>
            <span style={styles.promoBadge}>Limited Offer</span>
            <h2 style={styles.promoTitle}>Summer Sale is On!</h2>
            <p style={styles.promoText}>Get up to 50% off on selected items. Use code SUMMER50 at checkout.</p>
            <Link to="/products" className="btn-primary" style={styles.promoBtn}>
              Grab the Deals <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  hero: {
    backgroundColor: 'var(--color-secondary)',
    padding: 'var(--space-16) 0',
    overflow: 'hidden',
  },
  heroInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-12)',
  },
  heroContent: {
    flex: '1 1 55%',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-4xl)',
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.2,
    marginBottom: 'var(--space-4)',
  },
  heroAccent: {
    color: 'var(--color-primary)',
  },
  heroSub: {
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-muted)',
    lineHeight: 1.7,
    marginBottom: 'var(--space-8)',
    maxWidth: '540px',
  },
  heroCtas: {
    display: 'flex',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-10)',
    flexWrap: 'wrap',
  },
  heroBtn: {
    padding: 'var(--space-3) var(--space-8)',
    fontSize: 'var(--text-base)',
    gap: 'var(--space-2)',
    color: '#fff',
  },
  heroFeatures: {
    display: 'flex',
    gap: 'var(--space-8)',
    flexWrap: 'wrap',
  },
  heroFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    color: 'var(--color-text-muted)',
    fontSize: 'var(--text-sm)',
  },
  heroVisual: {
    flex: '1 1 45%',
    position: 'relative',
    height: '400px',
  },
  heroShapeLarge: {
    position: 'absolute',
    top: '10%',
    right: '10%',
    width: '250px',
    height: '250px',
    borderRadius: 'var(--radius-xl)',
    backgroundColor: 'var(--color-primary)',
    opacity: 0.15,
    transform: 'rotate(15deg)',
  },
  heroShapeMedium: {
    position: 'absolute',
    top: '30%',
    right: '30%',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary-light)',
    opacity: 0.2,
  },
  heroShapeSmall: {
    position: 'absolute',
    bottom: '20%',
    right: '15%',
    width: '80px',
    height: '80px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#fff',
    opacity: 0.08,
    transform: 'rotate(45deg)',
  },
  section: {
    padding: 'var(--space-12) 0',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-6)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  viewAll: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-primary)',
    textDecoration: 'none',
  },
  categoriesRow: {
    display: 'flex',
    gap: 'var(--space-3)',
    overflowX: 'auto',
    paddingBottom: 'var(--space-2)',
    scrollSnapType: 'x mandatory',
  },
  categoryChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-5)',
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-card)',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    scrollSnapAlign: 'start',
    textDecoration: 'none',
    color: 'inherit',
  },
  categoryIcon: {
    fontSize: 'var(--text-xl)',
  },
  categoryName: {
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
  },
  categoryCount: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
  categorySkeleton: {
    minWidth: '140px',
    height: '44px',
    borderRadius: 'var(--radius-full)',
    flexShrink: 0,
  },
  carousel: {
    display: 'flex',
    gap: 'var(--space-4)',
    overflowX: 'auto',
    paddingBottom: 'var(--space-2)',
    scrollSnapType: 'x mandatory',
  },
  promoBanner: {
    margin: 'var(--space-12) 0 0',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
    padding: 'var(--space-16) 0',
  },
  promoInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  promoContent: {
    maxWidth: '600px',
  },
  promoBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 'var(--text-xs)',
    fontWeight: 700,
    padding: 'var(--space-1) var(--space-3)',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 'var(--space-4)',
  },
  promoTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-3xl)',
    fontWeight: 700,
    color: '#fff',
    marginBottom: 'var(--space-3)',
  },
  promoText: {
    fontSize: 'var(--text-base)',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 'var(--space-6)',
  },
  promoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-8)',
    backgroundColor: '#fff',
    color: 'var(--color-primary)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-base)',
  },
};

export default HomePage;
