import React from 'react';
import { Link } from '../../router/Router';
import { FiX } from '../../utils/Icons';

const SellerPromptModal = ({ onClose }) => {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} className="fade-in-up">
        <button style={styles.closeBtn} onClick={onClose}>
          <FiX size={18} />
        </button>
        <div style={styles.iconWrap}>
          <span style={styles.icon}>🏪</span>
        </div>
        <h2 style={styles.title}>Seller Account Required</h2>
        <p style={styles.message}>
          You need a seller account to start selling. Create a new seller account or log in with an existing one.
        </p>
        <div style={styles.actions}>
          <Link to="/register?seller=true" style={styles.primaryBtn} onClick={onClose}>
            Sign Up as Seller
          </Link>
          <Link to="/login" style={styles.secondaryBtn} onClick={onClose}>
            Log In with Seller Account
          </Link>
        </div>
        <p style={styles.footer}>
          Already have a seller account? <Link to="/login" style={styles.footerLink} onClick={onClose}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-4)',
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-8)',
    textAlign: 'center',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
    border: '1px solid var(--color-border)',
  },
  closeBtn: {
    position: 'absolute',
    top: 'var(--space-4)',
    right: 'var(--space-4)',
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-muted)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
  },
  iconWrap: {
    marginBottom: 'var(--space-4)',
  },
  icon: {
    fontSize: '3rem',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-3)',
  },
  message: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
    marginBottom: 'var(--space-6)',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  primaryBtn: {
    display: 'block',
    width: '100%',
    padding: 'var(--space-3) var(--space-6)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    borderRadius: 'var(--radius-full)',
    textDecoration: 'none',
    boxShadow: '0 4px 15px rgba(255,107,53,0.3)',
    transition: 'all 0.3s',
  },
  secondaryBtn: {
    display: 'block',
    width: '100%',
    padding: 'var(--space-3) var(--space-6)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-full)',
    textDecoration: 'none',
    transition: 'all 0.3s',
  },
  footer: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
  footerLink: {
    color: 'var(--color-primary)',
    fontWeight: 600,
    textDecoration: 'none',
  },
};

export default SellerPromptModal;
