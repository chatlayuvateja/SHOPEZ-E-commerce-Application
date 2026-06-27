import React from 'react';
import { Link } from '../../router/Router';
import { FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiInstagram } from '../../utils/Icons';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.grid}>
          <div className="fade-in-up" style={styles.col}>
            <h3 style={styles.brand}>
              <span style={styles.logoIcon}>✦</span>
              Shop<span style={styles.accent}>EZ</span>
            </h3>
            <p style={styles.tagline}>
              The premium marketplace for quality products.
              Shop with confidence, delivered with care.
            </p>
            <div style={styles.socialIcons}>
              <a href="#!" style={styles.socialLink}><FiGithub size={18} /></a>
              <a href="#!" style={styles.socialLink}><FiTwitter size={18} /></a>
              <a href="#!" style={styles.socialLink}><FiInstagram size={18} /></a>
            </div>
          </div>
          <div className="fade-in-up" style={styles.col}>
            <h4 style={styles.heading}>Quick Links</h4>
            <Link to="/products" style={styles.link}>All Products</Link>
            <Link to="/cart" style={styles.link}>Shopping Cart</Link>
            <Link to="/my-orders" style={styles.link}>My Orders</Link>
            <Link to="/register" style={styles.link}>Seller Registration</Link>
          </div>
          <div className="fade-in-up" style={styles.col}>
            <h4 style={styles.heading}>Support</h4>
            <Link to="#!" style={styles.link}>Help Center</Link>
            <Link to="#!" style={styles.link}>Returns Policy</Link>
            <Link to="#!" style={styles.link}>Shipping Info</Link>
            <Link to="#!" style={styles.link}>FAQs</Link>
          </div>
          <div className="fade-in-up" style={styles.col}>
            <h4 style={styles.heading}>Contact Us</h4>
            <div style={styles.contactItem}>
              <FiMail size={14} style={{ flexShrink: 0 }} />
              <span>support@shopez.com</span>
            </div>
            <div style={styles.contactItem}>
              <FiPhone size={14} style={{ flexShrink: 0 }} />
              <span>+1 (555) 123-4567</span>
            </div>
            <div style={styles.contactItem}>
              <FiMapPin size={14} style={{ flexShrink: 0 }} />
              <span>123 Commerce St, Suite 100</span>
            </div>
          </div>
        </div>
        <div className="fade-in-up" style={styles.bottom}>
          <p style={styles.copyright}>
            &copy; {new Date().getFullYear()} ShopEZ. All rights reserved.
          </p>
          <div style={styles.bottomLinks}>
            <Link to="#!" style={styles.bottomLink}>Privacy Policy</Link>
            <Link to="#!" style={styles.bottomLink}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    position: 'relative',
    padding: 'var(--space-16) 0 0',
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-bg-secondary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: 'var(--space-12)',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  logoIcon: {
    color: 'var(--color-primary)',
    marginRight: 'var(--space-1)',
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 700,
    marginBottom: 'var(--space-2)',
    color: 'var(--color-text-primary)',
  },
  accent: {
    color: 'var(--color-primary)',
  },
  tagline: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
    lineHeight: 1.7,
    maxWidth: '320px',
  },
  socialIcons: {
    display: 'flex',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-2)',
  },
  socialLink: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
    transition: 'all 0.3s',
    textDecoration: 'none',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-base)',
    fontWeight: 600,
    marginBottom: 'var(--space-3)',
    color: 'var(--color-text-primary)',
  },
  link: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    transition: 'color 0.2s',
    textDecoration: 'none',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
  },
  bottom: {
    borderTop: '1px solid var(--color-border)',
    marginTop: 'var(--space-12)',
    padding: 'var(--space-6) 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 'var(--space-4)',
  },
  copyright: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },
  bottomLinks: {
    display: 'flex',
    gap: 'var(--space-6)',
  },
  bottomLink: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
};

export default Footer;
