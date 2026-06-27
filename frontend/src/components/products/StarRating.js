import React from 'react';
import { FiStar } from '../../utils/Icons';

const StarRating = ({ rating = 0, size = 16, showValue = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[...Array(fullStars)].map((_, i) => (
        <FiStar key={`full-${i}`} size={size} fill="var(--color-warning)" color="var(--color-warning)" />
      ))}
      {hasHalf && (
        <div style={{ position: 'relative', width: size, height: size }}>
          <FiStar size={size} color="var(--color-border)" />
          <div style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: '50%', height: '100%' }}>
            <FiStar size={size} fill="var(--color-warning)" color="var(--color-warning)" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FiStar key={`empty-${i}`} size={size} color="var(--color-border)" />
      ))}
      {showValue && (
        <span style={{ marginLeft: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {rating}
        </span>
      )}
    </div>
  );
};

export default StarRating;
