import React from 'react';
import { Link, useNavigate } from '../router/Router';
import { FiArrowRight, FiChevronRight, FiTruck, FiShield, FiPackage, FiRefreshCw, FiHeadphones, FiStar, FiTrendingUp } from '../utils/Icons';
import useFetch from '../hooks/useFetch';
import useAuth from '../hooks/useAuth';
import productAPI from '../api/productAPI';
import ProductCard from '../components/products/ProductCard';
import ProductCardSkeleton from '../components/products/ProductCardSkeleton';

const CATEGORIES = [
  { name: 'Electronics', icon: '⬡', desc: 'Gadgets & gear' },
  { name: 'Clothing', icon: '♢', desc: 'Style & fashion' },
  { name: 'Home & Kitchen', icon: '⌂', desc: 'Living essentials' },
  { name: 'Books', icon: '⎔', desc: 'Read & learn' },
  { name: 'Sports', icon: '⌘', desc: 'Play & fitness' },
  { name: 'Beauty', icon: '◈', desc: 'Glow & groom' },
  { name: 'Toys', icon: '✦', desc: 'Fun & games' },
  { name: 'Automotive', icon: '▣', desc: 'Drive & care' },
  { name: 'Health', icon: '♥', desc: 'Wellness & care' },
  { name: 'Groceries', icon: '◉', desc: 'Daily needs' },
  { name: 'Jewelry', icon: '◆', desc: 'Luxury & shine' },
  { name: 'Music', icon: '♪', desc: 'Tunes & audio' },
];

const FEATURES = [
  { icon: FiTruck, title: 'Free Delivery', desc: 'On orders over ₹999' },
  { icon: FiShield, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated help center' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: featuredData, isLoading: loadingFeatured } = useFetch(
    (signal) => productAPI.getFeatured(signal), []
  );
  const { isLoading: loadingCategories } = useFetch(
    (signal) => productAPI.getCategories(signal), []
  );

  const featured = featuredData?.products || [];

  const handleStartSelling = (e) => {
    e.preventDefault();
    if (isAuthenticated && user.role === 'SELLER') {
      navigate('/seller/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section" style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div className="container" style={styles.heroInner}>
          <div className="fade-in-up" style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Discover <span style={styles.heroAccent}>Premium</span><br />
              Products That Inspire
            </h1>
            <p style={styles.heroSub}>
              Curated marketplace for quality products at unbeatable prices.
              Shop millions of items with free delivery and secure payments.
            </p>
            <div className="fade-in-up" style={styles.heroCtas}>
              <Link to="/products" className="btn-primary" style={styles.heroBtn}>
                Explore Now <FiArrowRight size={18} />
              </Link>
              <a href="/register" className="btn-secondary" style={styles.heroBtnOutline} onClick={handleStartSelling}>
                Start Selling
              </a>
            </div>
            <div className="fade-in-up" style={styles.heroStats}>
              <div style={styles.stat}>
                <span style={styles.statValue}>10K+</span>
                <span style={styles.statLabel}>Products</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>50K+</span>
                <span style={styles.statLabel}>Customers</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>500+</span>
                <span style={styles.statLabel}>Sellers</span>
              </div>
            </div>
          </div>
          <div className="fade-in-up" style={styles.heroVisual}>
            <div style={styles.heroCard}>
              <div style={styles.heroCardGlow} />
              <div style={styles.heroCardContent}>
                <span style={styles.heroCardIcon}>✦</span>
                <p style={styles.heroCardText}>Premium Quality</p>
              </div>
            </div>
          </div>
        </div>
        <div className="float-animation" style={styles.scrollIndicator}>
          <FiChevronRight size={24} style={{ transform: 'rotate(90deg)' }} />
        </div>
      </section>

      {/* Features Strip */}
      <section className="fade-in-up" style={styles.featuresStrip}>
        <div className="container" style={styles.featuresGrid}>
          {FEATURES.map((feat, i) => (
            <div
              key={feat.title}
              className="fade-in-up"
              style={styles.featureItem}
            >
              <div style={styles.featureIcon}>
                <feat.icon size={20} />
              </div>
              <div>
                <p style={styles.featureTitle}>{feat.title}</p>
                <p style={styles.featureDesc}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container section" style={styles.section}>
        <div className="fade-in-up" style={styles.sectionHeader}>
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Browse thousands of products across categories</p>
          </div>
          <Link to="/products" style={styles.viewAll}>
            View All <FiChevronRight size={16} />
          </Link>
        </div>
        <div className="stagger-children" style={styles.categoriesGrid}>
          {loadingCategories
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={styles.categorySkeleton} />
              ))
            : CATEGORIES.map((cat, i) => (
                <div key={cat.name} className="fade-in-up">
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    style={styles.categoryCard}
                  >
                    <span style={styles.categoryIcon}>{cat.icon}</span>
                    <span style={styles.categoryName}>{cat.name}</span>
                    <span style={styles.categoryDesc}>{cat.desc}</span>
                  </Link>
                </div>
              ))
          }
        </div>
      </section>

      {/* Featured Products */}
      <section className="container section" style={styles.section}>
        <div className="fade-in-up" style={styles.sectionHeader}>
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Handpicked favorites just for you</p>
          </div>
          <Link to="/products?featured=true" style={styles.viewAll}>
            View All <FiChevronRight size={16} />
          </Link>
        </div>
        <div className="stagger-children" style={styles.productsGrid}>
          {loadingFeatured
            ? [...Array(4)].map((_, i) => (
                <div key={i} style={{ minWidth: 0 }}>
                  <ProductCardSkeleton />
                </div>
              ))
            : featured.map((product, i) => (
                <div key={product._id} className="fade-in-up">
                  <ProductCard product={product} index={i} />
                </div>
              ))
          }
        </div>
      </section>

      {/* Promo Banner */}
      <section style={styles.promoBanner}>
        <div className="container" style={styles.promoInner}>
          <div className="fade-in-up" style={styles.promoContent}>
            <span
              className="pulse-animation"
              style={styles.promoBadge}
            >
              Limited Time Offer
            </span>
            <h2 style={styles.promoTitle}>Summer Sale is Live!</h2>
            <p style={styles.promoText}>
              Get up to <strong>50% off</strong> on selected items. Use code <span style={styles.promoCode}>SUMMER50</span> at checkout.
            </p>
            <div>
              <Link to="/products" className="scale-in" style={styles.promoBtn}>
                Grab the Deals <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Stats */}
      <section className="container section" style={{ ...styles.section, textAlign: 'center' }}>
        <div className="fade-in-up">
          <h2 className="section-title">Why ShopEZ?</h2>
          <p className="section-subtitle">The most trusted marketplace for premium products</p>
        </div>
        <div className="stagger-children" style={styles.statsGrid}>
          {[
            { icon: FiPackage, value: '50K+', label: 'Products' },
            { icon: FiTrendingUp, value: '10M+', label: 'Orders Delivered' },
            { icon: FiStar, value: '4.8★', label: 'Average Rating' },
            { icon: FiShield, value: '100%', label: 'Secure Payments' },
          ].map((stat, i) => (
            <div key={stat.label} className="scale-in" style={styles.statCard}>
              <div style={styles.statCardIcon}>
                <stat.icon size={24} />
              </div>
              <p style={styles.statCardValue}>{stat.value}</p>
              <p style={styles.statCardLabel}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div className="container" style={styles.ctaInner}>
          <div className="fade-in-up" style={styles.ctaContent}>
            <h2 style={styles.ctaTitle}>Ready to Start Selling?</h2>
            <p style={styles.ctaText}>
              Join thousands of sellers and reach millions of customers worldwide.
              Set up your store in minutes.
            </p>
            <div>
              <a href="/register" className="scale-in" style={styles.ctaBtn} onClick={handleStartSelling}>
                Become a Seller <FiArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const styles = {
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    paddingTop: 'var(--navbar-height)',
    background: 'linear-gradient(135deg, rgba(255,107,53,0.08) 0%, rgba(74,144,217,0.06) 50%, rgba(10,10,15,1) 100%)',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0) 40%, rgba(10,10,15,0.8) 100%)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  heroInner: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-12)',
    width: '100%',
  },
  heroContent: {
    flex: '1 1 55%',
  },

  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-6xl)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    lineHeight: 1.1,
    marginBottom: 'var(--space-6)',
    letterSpacing: '-0.02em',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, var(--color-primary), #FFB088)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
    marginBottom: 'var(--space-8)',
    maxWidth: '540px',
    fontFamily: 'var(--font-body)',
  },
  heroCtas: {
    display: 'flex',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-12)',
    flexWrap: 'wrap',
  },
  heroBtn: {
    padding: 'var(--space-3) var(--space-10)',
    fontSize: 'var(--text-base)',
    gap: 'var(--space-2)',
  },
  heroBtnOutline: {
    padding: 'var(--space-3) var(--space-10)',
    fontSize: 'var(--text-base)',
    gap: 'var(--space-2)',
  },
  heroStats: {
    display: 'flex',
    gap: 'var(--space-8)',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  },
  statValue: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
  },
  statLabel: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: 'var(--font-mono)',
  },
  heroVisual: {
    flex: '1 1 45%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    position: 'relative',
    width: '280px',
    height: '360px',
    borderRadius: 'var(--radius-xl)',
    background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,140,90,0.05))',
    border: '1px solid rgba(255,107,53,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroCardGlow: {
    position: 'absolute',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,107,53,0.2), transparent)',
    animation: 'glow 3s ease-in-out infinite',
  },
  heroCardContent: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  heroCardIcon: {
    fontSize: '3rem',
    color: 'var(--color-primary)',
    display: 'block',
    marginBottom: 'var(--space-4)',
  },
  heroCardText: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  heroCardBadge: {
    display: 'inline-block',
    marginTop: 'var(--space-3)',
    padding: 'var(--space-1) var(--space-3)',
    background: 'rgba(255,107,53,0.15)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-primary)',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 'var(--space-8)',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'var(--color-text-muted)',
    zIndex: 2,
  },
  featuresStrip: {
    padding: 'var(--space-8) 0',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-bg-secondary)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'var(--space-6)',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-lg)',
    background: 'rgba(255, 107, 53, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-primary)',
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  featureDesc: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
  section: {
    position: 'relative',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-8)',
  },
  viewAll: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'nowrap',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 'var(--space-3)',
  },
  categorySkeleton: {
    height: '100px',
    borderRadius: 'var(--radius-lg)',
  },
  categoryCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-5) var(--space-3)',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s',
    cursor: 'pointer',
    textAlign: 'center',
  },
  categoryIcon: {
    fontSize: '2rem',
  },
  categoryName: {
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
  },
  categoryDesc: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 'var(--space-5)',
  },
  promoBanner: {
    position: 'relative',
    isolation: 'isolate',
    overflow: 'hidden',
    padding: 'var(--space-20) 0',
  },
  promoInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  promoContent: {
    maxWidth: '650px',
  },
  promoBadge: {
    display: 'inline-block',
    background: 'linear-gradient(90deg, var(--color-primary), #FF8F65, var(--color-primary))',
    backgroundSize: '200% 100%',
    color: '#fff',
    fontSize: 'var(--text-xs)',
    fontWeight: 700,
    padding: 'var(--space-1) var(--space-4)',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 'var(--space-4)',
    fontFamily: 'var(--font-mono)',
  },
  promoTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-4xl)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-3)',
  },
  promoText: {
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-6)',
    lineHeight: 1.7,
  },
  promoCode: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-primary)',
    fontWeight: 600,
    padding: 'var(--space-1) var(--space-3)',
    background: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 'var(--radius-sm)',
  },
  promoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-10)',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-base)',
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--space-6)',
    marginTop: 'var(--space-6)',
  },
  statCard: {
    padding: 'var(--space-8) var(--space-6)',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)',
    textAlign: 'center',
    transition: 'all 0.3s',
  },
  statCardIcon: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-lg)',
    background: 'rgba(255, 107, 53, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-primary)',
    margin: '0 auto var(--space-4)',
  },
  statCardValue: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-3xl)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-1)',
  },
  statCardLabel: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },
  ctaSection: {
    position: 'relative',
    padding: 'var(--space-24) 0',
    background: 'linear-gradient(135deg, rgba(255,107,53,0.05) 0%, rgba(74,144,217,0.05) 100%)',
    borderTop: '1px solid var(--color-border)',
  },
  ctaInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  ctaContent: {
    maxWidth: '600px',
  },
  ctaTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-4xl)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-4)',
  },
  ctaText: {
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-8)',
    lineHeight: 1.7,
  },
  ctaBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-10)',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-base)',
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
  },
};

export default HomePage;
