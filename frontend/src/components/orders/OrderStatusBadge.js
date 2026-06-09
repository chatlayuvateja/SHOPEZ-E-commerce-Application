const statusConfig = {
  pending: { label: 'Pending', color: '#6B7280', bg: '#F3F4F6' },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: '#DBEAFE' },
  shipped: { label: 'Shipped', color: '#F59E0B', bg: '#FEF3C7' },
  delivered: { label: 'Delivered', color: '#10B981', bg: '#D1FAE5' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' },
};

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: config.color,
        }}
      />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
