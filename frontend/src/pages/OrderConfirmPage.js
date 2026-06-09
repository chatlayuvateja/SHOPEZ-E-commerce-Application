import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiPackage, FiMapPin, FiCreditCard, FiHome, FiShoppingBag, FiCopy, FiCheck } from 'react-icons/fi';
import orderAPI from '../api/orderAPI';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import ErrorState from '../components/common/ErrorState';
import { formatINR } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import parseAPIError from '../utils/errorParser';

const OrderConfirmPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await orderAPI.getById(id);
        setOrder(data.order);
      } catch (err) {
        setError(parseAPIError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = order._id;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container" style={styles.page}>
        <div className="page-loader"><div className="spinner"></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={styles.page}>
        <ErrorState message={error} />
      </div>
    );
  }

  if (!order) return null;

  const orderDate = formatDateTime(order.createdAt);

  return (
    <div className="container" style={styles.page}>
      <div style={styles.successBanner}>
        <div style={styles.checkmarkWrap}>
          <svg style={styles.checkmarkSvg} viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle style={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
            <path style={styles.checkmarkPath} fill="none" d="M14 27l7 7 16-16" />
          </svg>
        </div>
        <h1 style={styles.successTitle}>Order Confirmed!</h1>
        <p style={styles.successMsg}>Thank you for your purchase. Your order has been placed successfully.</p>

        <div style={styles.orderIdRow}>
          <span style={styles.orderIdLabel}>Order ID:</span>
          <span style={styles.orderIdValue}>#{order._id}</span>
          <button onClick={handleCopy} style={styles.copyBtn} title="Copy Order ID">
            {copied ? <FiCheck size={16} style={{ color: 'var(--color-success)' }} /> : <FiCopy size={16} />}
          </button>
        </div>

        <div style={styles.estDelivery}>
          <FiPackage size={16} />
          <span>Estimated delivery: <strong>5-7 business days</strong></span>
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.details}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}><FiPackage size={18} /> Order Status</h3>
            <OrderStatusBadge status={order.status} />
            <p style={styles.dateText}>Placed on {orderDate}</p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}><FiMapPin size={18} /> Delivery Address</h3>
            {order.shippingAddress?.fullName && <p style={styles.addressLine}>{order.shippingAddress.fullName}</p>}
            <p style={styles.addressLine}>{order.shippingAddress?.street}</p>
            <p style={styles.addressLine}>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
            </p>
            <p style={styles.addressLine}>{order.shippingAddress?.country}</p>
            <p style={styles.addressLine}>Phone: {order.phone}</p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}><FiCreditCard size={18} /> Payment Summary</h3>
            <div style={styles.summaryRow}><span>Items Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            <div style={styles.summaryRow}><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : formatINR(order.shippingCost)}</span></div>
            <div style={styles.summaryRow}><span>Tax (18% GST)</span><span>{formatINR(order.tax)}</span></div>
            <div style={{ ...styles.summaryRow, ...styles.totalRow }}><span>Total</span><span style={styles.totalPrice}>{formatINR(order.total)}</span></div>
          </div>
        </div>

        <div style={styles.itemsCard}>
          <h3 style={styles.cardTitle}><FiPackage size={18} /> Items Ordered ({order.items?.length || 0})</h3>
          <div style={styles.itemsList}>
            {order.items?.map((item, idx) => {
              const product = item.product || {};
              return (
                <div key={idx} style={styles.item}>
                  <img src={product.images?.[0]?.url || 'https://via.placeholder.com/72'} alt={product.name} style={styles.itemImg} />
                  <div style={styles.itemInfo}>
                    <p style={styles.itemName}>{product.name || 'Product'}</p>
                    <p style={styles.itemDetail}>Qty: {item.quantity} × {formatINR(item.price)}</p>
                  </div>
                  <span style={styles.itemTotal}>{formatINR(item.price * item.quantity)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <Link to="/my-orders" className="btn-primary" style={styles.actionBtn}>
          <FiPackage size={16} /> Track My Orders
        </Link>
        <Link to="/products" className="btn-ghost" style={styles.actionBtn}>
          <FiShoppingBag size={16} /> Continue Shopping
        </Link>
        <Link to="/" className="btn-ghost" style={styles.actionBtn}>
          <FiHome size={16} /> Back to Home
        </Link>
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' },
  successBanner: { textAlign: 'center', padding: 'var(--space-10) var(--space-6)', marginBottom: 'var(--space-8)', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' },
  checkmarkWrap: { width: 72, height: 72, margin: '0 auto var(--space-5)', position: 'relative' },
  checkmarkSvg: { width: '100%', height: '100%' },
  checkmarkCircle: { stroke: 'var(--color-success)', strokeWidth: 2, strokeDasharray: 166, strokeDashoffset: 166, animation: 'checkmarkCircle 0.6s ease-in-out forwards', fill: 'none' },
  checkmarkPath: { stroke: 'var(--color-success)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: 48, strokeDashoffset: 48, animation: 'checkmarkPath 0.4s 0.6s ease-in-out forwards' },
  successTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' },
  successMsg: { fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' },
  orderIdRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' },
  orderIdLabel: { fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' },
  orderIdValue: { fontFamily: 'monospace', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', wordBreak: 'break-all' },
  copyBtn: { padding: 'var(--space-1) var(--space-2)', cursor: 'pointer', color: 'var(--color-text-muted)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center' },
  estDelivery: { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', color: '#166534' },
  layout: { display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' },
  details: { flex: '1 1 35%', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' },
  card: { backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-card)' },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' },
  dateText: { fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' },
  addressLine: { fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: '2px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' },
  totalRow: { borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-1)', color: 'var(--color-text-primary)', fontWeight: 600 },
  totalPrice: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-primary)' },
  itemsCard: { flex: '1 1 55%', minWidth: '300px', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-card)', alignSelf: 'flex-start' },
  itemsList: { display: 'flex', flexDirection: 'column' },
  item: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' },
  itemImg: { width: 60, height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' },
  itemDetail: { fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' },
  itemTotal: { fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-display)' },
  actions: { display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' },
  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-sm)', textDecoration: 'none' },
};

const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes checkmarkCircle {
  to { stroke-dashoffset: 0; }
}
@keyframes checkmarkPath {
  to { stroke-dashoffset: 0; }
}
`;
document.head.appendChild(styleTag);

export default OrderConfirmPage;
