import React from 'react';
import { FiStar } from '../../utils/Icons';

const ReviewCard = ({ review }) => {
  const { user, rating, title, comment, createdAt, isVerifiedPurchase } = review;

  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p style={styles.userName}>{user?.name || 'Anonymous'}</p>
            <p style={styles.date}>
              {createdAt ? new Date(createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
          </div>
        </div>
        {isVerifiedPurchase && (
          <span style={styles.verified}>Verified Purchase</span>
        )}
      </div>
      <div style={styles.stars}>
        {[...Array(fullStars)].map((_, i) => (
          <FiStar key={i} size={16} fill="var(--color-warning)" color="var(--color-warning)" />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <FiStar key={`e-${i}`} size={16} color="var(--color-border)" />
        ))}
      </div>
      <h4 style={styles.title}>{title}</h4>
      <p style={styles.comment}>{comment}</p>
      <div style={styles.separator}></div>
    </div>
  );
};

const styles = {
  card: {
    padding: 'var(--space-4) 0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-3)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-primary-light)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
  },
  userName: {
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  date: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    marginTop: '2px',
  },
  verified: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-success)',
    fontWeight: 600,
    padding: '2px 8px',
    backgroundColor: '#F0FDF4',
    borderRadius: 'var(--radius-full)',
  },
  stars: {
    display: 'flex',
    gap: '2px',
    marginBottom: 'var(--space-2)',
  },
  title: {
    fontSize: 'var(--text-base)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-1)',
    fontFamily: 'var(--font-display)',
  },
  comment: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
  },
  separator: {
    height: '1px',
    backgroundColor: 'var(--color-border-light)',
    marginTop: 'var(--space-4)',
  },
};

export default ReviewCard;
