import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        <div style={styles.grid}>
          <div style={styles.col}>
            <h3 style={styles.brand}>
              Shop<span style={styles.accent}>EZ</span>
            </h3>
            <p style={styles.tagline}>
              Your one-stop destination for quality products at unbeatable prices. Shop with confidence, delivered with care.
            </p>
          </div>
          <div style={styles.col}>
            <h4 style={styles.heading}>Quick Links</h4>
            <Link to="/products" style={styles.link}>All Products</Link>
            <Link to="/cart" style={styles.link}>Cart</Link>
            <Link to="/my-orders" style={styles.link}>My Orders</Link>
          </div>
          <div style={styles.col}>
            <h4 style={styles.heading}>Contact</h4>
            <p style={styles.contact}>support@shopez.com</p>
            <p style={styles.contact}>+1 (555) 123-4567</p>
            <p style={styles.contact}>123 Commerce St, Suite 100</p>
          </div>
        </div>
        <div style={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} ShopEZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: 'var(--color-secondary)',
    color: '#fff',
    padding: 'var(--space-16) 0 0',
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: 'var(--space-12)',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 700,
    marginBottom: 'var(--space-2)',
  },
  accent: {
    color: 'var(--color-primary)',
  },
  tagline: {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--text-sm)',
    lineHeight: 1.7,
    maxWidth: '320px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-base)',
    fontWeight: 600,
    marginBottom: 'var(--space-3)',
  },
  link: {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    transition: 'color var(--transition-fast)',
    textDecoration: 'none',
  },
  contact: {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--text-sm)',
  },
  bottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    marginTop: 'var(--space-12)',
    padding: 'var(--space-6) 0',
    textAlign: 'center',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },
};

export default Footer;
