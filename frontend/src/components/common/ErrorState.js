import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const ErrorState = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div style={styles.container}>
      <div style={styles.iconWrap}>
        <FiAlertTriangle size={48} style={styles.icon} />
      </div>
      <h3 style={styles.title}>Oops!</h3>
      <p style={styles.message}>{message}</p>
      {onRetry && (
        <button className="btn-primary" onClick={onRetry} style={styles.btn}>
          Try Again
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-16) var(--space-4)',
    textAlign: 'center',
  },
  iconWrap: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 'var(--radius-full)',
    marginBottom: 'var(--space-6)',
  },
  icon: {
    color: 'var(--color-error)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-2)',
  },
  message: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-6)',
    maxWidth: '400px',
  },
  btn: {
    marginTop: 'var(--space-2)',
  },
};

export default ErrorState;
