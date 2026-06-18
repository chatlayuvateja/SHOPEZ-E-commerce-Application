import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div style={styles.page}>
      <motion.div
        style={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.illustration}>
          <motion.div
            style={styles.shape404}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span style={styles.shapeText}>404</span>
          </motion.div>
          <motion.div
            style={styles.shapeCircle1}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            style={styles.shapeCircle2}
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.message}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={styles.actions}>
          <Link to="/" style={styles.btnPrimary}>
            <FiHome size={18} /> Back to Home
          </Link>
          <Link to="/products" style={styles.btnGhost}>
            <FiSearch size={18} /> Browse Products
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - var(--navbar-height))',
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
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    position: 'relative',
    boxShadow: 'var(--glass-shadow)',
  },
  shapeText: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-5xl)',
    fontWeight: 700,
    background: 'linear-gradient(135deg, var(--color-primary), #FFB088)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  shapeCircle1: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '60px',
    height: '60px',
    borderRadius: 'var(--radius-full)',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    opacity: 0.2,
  },
  shapeCircle2: {
    position: 'absolute',
    bottom: '10px',
    left: '-15px',
    width: '80px',
    height: '80px',
    borderRadius: 'var(--radius-full)',
    background: 'linear-gradient(135deg, var(--color-accent-blue), transparent)',
    opacity: 0.15,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-3xl)',
    fontWeight: 700,
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
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-8)',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 'var(--radius-full)',
    textDecoration: 'none',
    fontSize: 'var(--text-sm)',
    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-8)',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--glass-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
    borderRadius: 'var(--radius-full)',
    textDecoration: 'none',
    fontSize: 'var(--text-sm)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
};

export default NotFoundPage;
