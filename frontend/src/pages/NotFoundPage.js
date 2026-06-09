import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.illustration}>
          <div style={styles.shape404}>
            <span style={styles.shapeText}>404</span>
          </div>
          <div style={styles.shapeCircle1}></div>
          <div style={styles.shapeCircle2}></div>
          <div style={styles.shapeLine}></div>
        </div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.message}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={styles.actions}>
          <Link to="/" className="btn-primary" style={styles.btn}>
            <FiHome size={18} /> Back to Home
          </Link>
          <Link to="/products" className="btn-ghost" style={styles.btn}>
            <FiSearch size={18} /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - var(--navbar-height) - 300px)',
    padding: 'var(--space-8)',
  },
  container: {
    textAlign: 'center',
    maxWidth: '500px',
  },
  illustration: {
    position: 'relative',
    width: '200px',
    height: '200px',
    margin: '0 auto var(--space-8)',
  },
  shape404: {
    width: '200px',
    height: '200px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    position: 'relative',
  },
  shapeText: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-4xl)',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  shapeCircle1: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '60px',
    height: '60px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-primary-light)',
    opacity: 0.3,
  },
  shapeCircle2: {
    position: 'absolute',
    bottom: '10px',
    left: '-15px',
    width: '80px',
    height: '80px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-primary)',
    opacity: 0.1,
  },
  shapeLine: {
    position: 'absolute',
    bottom: '20px',
    right: '-20px',
    width: '40px',
    height: '4px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-primary-light)',
    opacity: 0.4,
    transform: 'rotate(-30deg)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-3)',
  },
  message: {
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    marginBottom: 'var(--space-8)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--space-4)',
    flexWrap: 'wrap',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-6)',
    fontSize: 'var(--text-sm)',
  },
};

export default NotFoundPage;
