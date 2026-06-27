import React from 'react';
import { FiInbox } from '../../utils/Icons';

const EmptyState = ({ icon: Icon = FiInbox, title = 'Nothing here', message = '', actionLabel, onAction }) => {
  return (
    <div style={styles.container}>
      <div style={styles.iconWrap}>
        <Icon size={48} style={styles.icon} />
      </div>
      <h3 style={styles.title}>{title}</h3>
      {message && <p style={styles.message}>{message}</p>}
      {actionLabel && onAction && (
        <button className="btn-primary" onClick={onAction} style={styles.btn}>
          {actionLabel}
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
    backgroundColor: 'var(--color-border-light)',
    borderRadius: 'var(--radius-full)',
    marginBottom: 'var(--space-6)',
  },
  icon: {
    color: 'var(--color-text-muted)',
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

export default EmptyState;
