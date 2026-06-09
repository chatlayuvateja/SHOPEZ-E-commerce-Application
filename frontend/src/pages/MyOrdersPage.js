import React, { useState, useEffect, useCallback } from 'react';
import { FiPackage, FiChevronDown, FiChevronUp, FiXCircle } from 'react-icons/fi';
import orderAPI from '../api/orderAPI';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Pagination from '../components/common/Pagination';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import parseAPIError from '../utils/errorParser';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderAPI.getMyOrders({ page });
      setOrders(data.orders);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelInit = (order) => {
    setCancellingOrder(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    setCancelling(true);
    try {
      const data = await orderAPI.cancel(cancellingOrder._id, cancelReason);
      setOrders((prev) => prev.map((o) => (o._id === cancellingOrder._id ? data.order : o)));
      setShowCancelModal(false);
      setCancellingOrder(null);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(parseAPIError(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="container" style={styles.page}>
        <h1 style={styles.title}>My Orders</h1>
        <div className="page-loader"><div className="spinner"></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={styles.page}>
        <h1 style={styles.title}>My Orders</h1>
        <ErrorState message={error} onRetry={fetchOrders} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container" style={styles.page}>
        <h1 style={styles.title}>My Orders</h1>
        <EmptyState
          icon={FiPackage}
          title="No orders yet"
          message="You haven't placed any orders yet. Start shopping to see your orders here."
          actionLabel="Start Shopping"
          onAction={() => window.location.href = '/products'}
        />
      </div>
    );
  }

  const canCancel = (status) => ['pending', 'confirmed'].includes(status);

  return (
    <div className="container" style={styles.page}>
      <h1 style={styles.title}>My Orders</h1>
      <div style={styles.list}>
        {orders.map((order) => {
          const isExpanded = expandedId === order._id;
          const itemsCount = order.items?.length || 0;
          const firstItem = order.items?.[0];
          const orderDate = formatDate(order.createdAt);
          const eligibleForCancel = canCancel(order.status);

          return (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderMain} onClick={() => setExpandedId(isExpanded ? null : order._id)}>
                <div style={styles.orderCol}>
                  <span style={styles.orderIdLabel}>Order</span>
                  <span style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                </div>
                <div style={styles.orderCol}>
                  <span style={styles.orderDate}>{orderDate}</span>
                </div>
                <div style={styles.orderCol}>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div style={styles.orderCol}>
                  <span style={styles.orderTotal}>{formatINR(order.total)}</span>
                </div>
                <div style={styles.orderCol}>
                  <span style={styles.orderCount}>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                </div>
                <div style={styles.orderExpandIcon}>
                  {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
              </div>

              {isExpanded && (
                <div style={styles.orderDetails}>
                  {firstItem && (
                    <div style={styles.detailItems}>
                      <h4 style={styles.detailTitle}>Items</h4>
                      {order.items?.map((item, idx) => {
                        const product = item.product || {};
                        return (
                          <div key={idx} style={styles.detailItem}>
                            <img src={product.images?.[0]?.url || 'https://via.placeholder.com/48'} alt={product.name} style={styles.detailItemImg} />
                            <div style={styles.detailItemInfo}>
                              <p style={styles.detailItemName}>{product.name || 'Product'}</p>
                              <p style={styles.detailItemQty}>Qty: {item.quantity} × {formatINR(item.price)}</p>
                            </div>
                            <span style={styles.detailItemTotal}>{formatINR(item.price * item.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {order.shippingAddress && (
                    <div style={styles.detailAddress}>
                      <h4 style={styles.detailTitle}>Shipping Address</h4>
                      {order.shippingAddress?.fullName && <p style={styles.addressText}>{order.shippingAddress.fullName}</p>}
                      <p style={styles.addressText}>{order.shippingAddress.street}</p>
                      <p style={styles.addressText}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                      <p style={styles.addressText}>{order.shippingAddress.country}</p>
                      <p style={styles.addressText}>Phone: {order.phone}</p>
                    </div>
                  )}

                  <div style={styles.detailTotals}>
                    <div style={styles.detailRow}><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
                    <div style={styles.detailRow}><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : formatINR(order.shippingCost)}</span></div>
                    <div style={styles.detailRow}><span>Tax (18% GST)</span><span>{formatINR(order.tax)}</span></div>
                    <div style={{ ...styles.detailRow, ...styles.detailTotalRow }}><span>Total</span><span>{formatINR(order.total)}</span></div>
                  </div>

                  {eligibleForCancel && (
                    <div style={styles.detailActions}>
                      <button onClick={(e) => { e.stopPropagation(); handleCancelInit(order); }} style={styles.cancelBtn}>
                        <FiXCircle size={16} /> Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {showCancelModal && (
        <div style={styles.overlay} onClick={() => setShowCancelModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Cancel Order</h3>
            <p style={styles.modalText}>
              Are you sure you want to cancel order <strong>#{cancellingOrder?._id.slice(-8).toUpperCase()}</strong>?
            </p>
            <div style={styles.field}>
              <label style={styles.label}>Reason for cancellation</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={styles.textarea}
                placeholder="Please tell us why you're cancelling..."
                rows={3}
              />
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowCancelModal(false)} className="btn-ghost" style={styles.modalBtn}>Keep Order</button>
              <button onClick={handleCancelSubmit} className="btn-primary" disabled={cancelling || !cancelReason.trim()} style={{ ...styles.modalBtn, backgroundColor: 'var(--color-error)' }}>
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' },
  title: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, marginBottom: 'var(--space-6)' },
  list: { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' },
  orderCard: { backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' },
  orderMain: { display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)', cursor: 'pointer', flexWrap: 'wrap' },
  orderCol: { display: 'flex', flexDirection: 'column', gap: '2px' },
  orderIdLabel: { fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  orderId: { fontFamily: 'monospace', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' },
  orderDate: { fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' },
  orderTotal: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' },
  orderCount: { fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' },
  orderExpandIcon: { marginLeft: 'auto', color: 'var(--color-text-muted)' },
  orderDetails: { padding: '0 var(--space-5) var(--space-5)', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-border-light)' },
  detailItems: { marginBottom: 'var(--space-4)' },
  detailTitle: { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' },
  detailItem: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0' },
  detailItemImg: { width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 },
  detailItemInfo: { flex: 1 },
  detailItemName: { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' },
  detailItemQty: { fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' },
  detailItemTotal: { fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-display)' },
  detailAddress: { marginBottom: 'var(--space-4)' },
  addressText: { fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: '2px' },
  detailTotals: { marginBottom: 'var(--space-4)' },
  detailRow: { display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' },
  detailTotalRow: { borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-1)', color: 'var(--color-text-primary)', fontWeight: 600 },
  detailActions: { display: 'flex', gap: 'var(--space-3)' },
  cancelBtn: { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-error)', backgroundColor: 'transparent', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' },
  modal: { backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', width: '100%', maxWidth: '480px' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' },
  modalText: { fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 },
  field: { marginBottom: 'var(--space-4)' },
  label: { display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' },
  textarea: { width: '100%', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' },
  modalBtn: { padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)' },
};

export default MyOrdersPage;
