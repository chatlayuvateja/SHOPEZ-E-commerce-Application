import React from 'react';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import EmptyState from '../components/common/EmptyState';
import { formatINR } from '../utils/formatCurrency';

const CartPage = () => {
  const { items, isLoading, isSyncing, error, updateQuantity, removeFromCart, fetchCart } = useCart();

  if (isLoading) {
    return (
      <div className="container" style={styles.page}>
        <div className="page-loader"><div className="spinner"></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={styles.page}>
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchCart}>Retry</button>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container" style={styles.page}>
        <EmptyState
          icon={FiShoppingBag}
          title="Your cart is empty"
          message="Looks like you haven't added anything to your cart yet."
          actionLabel="Start Shopping"
          onAction={() => window.location.href = '/products'}
        />
      </div>
    );
  }

  return (
    <div className="container" style={styles.page}>
      <h1 style={styles.title}>Shopping Cart</h1>
      <p style={styles.count}>{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>

      <div style={styles.layout}>
        <div style={styles.itemsList}>
          {items.map((item) => {
            const product = item.product || {};
            const itemPrice = item.priceAtAdd || product.finalPrice || product.price || 0;
            const itemTotal = itemPrice * (item.quantity || 1);
            const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : 'https://picsum.photos/seed/default/120';

            return (
              <div key={item._id || product._id} style={styles.cartItem}>
                <Link to={`/products/${product.slug || ''}`} style={styles.itemImageWrap}>
                  <img src={imageUrl} alt={product.name} style={styles.itemImage} />
                </Link>
                <div style={styles.itemInfo}>
                  <Link to={`/products/${product.slug || ''}`} style={styles.itemName}>
                    {product.name || 'Product'}
                  </Link>
                  <p style={styles.itemPrice}>{formatINR(itemPrice)} each</p>
                  <div style={styles.itemActions}>
                    <div style={styles.qtyControls}>
                      <button
                        onClick={() => updateQuantity(product._id, (item.quantity || 1) - 1)}
                        disabled={(item.quantity || 1) <= 1 || isSyncing}
                        style={styles.qtyBtn}
                      >
                        <FiMinus size={14} />
                      </button>
                      <span style={styles.qtyValue}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(product._id, (item.quantity || 1) + 1)}
                        disabled={item.quantity >= (product.stock || 10) || isSyncing}
                        style={styles.qtyBtn}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(product._id)} style={styles.removeBtn} disabled={isSyncing}>
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div style={styles.itemTotal}>
                  <span style={styles.itemTotalPrice}>{formatINR(itemTotal)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.summary}>
          <h3 style={styles.summaryTitle}>Order Summary</h3>
          <div style={styles.summaryRow}>
            <span>Items Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Estimated Shipping</span>
            <span>{shipping === 0 ? <span style={{ color: 'var(--color-success)' }}>FREE</span> : formatINR(shipping)}</span>
          </div>
          {shipping > 0 && (
            <p style={styles.shippingNote}>Add {formatINR(999 - subtotal)} more for free shipping!</p>
          )}
          <div style={{ ...styles.summaryRow, ...styles.summaryTotalRow }}>
            <span>Total</span>
            <span style={styles.totalPrice}>{formatINR(total)}</span>
          </div>
          <Link to="/checkout" className="btn-primary" style={styles.checkoutBtn}>
            Proceed to Checkout
          </Link>
          <Link to="/products" style={styles.continueShopping}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    paddingTop: 'var(--space-8)',
    paddingBottom: 'var(--space-12)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 600,
    marginBottom: 'var(--space-1)',
  },
  count: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-6)',
  },
  layout: {
    display: 'flex',
    gap: 'var(--space-8)',
    flexWrap: 'wrap',
  },
  itemsList: {
    flex: '1 1 60%',
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  },
  cartItem: {
    display: 'flex',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    alignItems: 'center',
  },
  itemImageWrap: {
    width: '100px',
    height: '100px',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: 'var(--space-1)',
  },
  itemPrice: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-3)',
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  qtyBtn: {
    padding: 'var(--space-1) var(--space-2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    border: 'none',
    background: 'none',
  },
  qtyValue: {
    padding: 'var(--space-1) var(--space-3)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    minWidth: '32px',
    textAlign: 'center',
    borderLeft: '1px solid var(--color-border)',
    borderRight: '1px solid var(--color-border)',
  },
  removeBtn: {
    padding: 'var(--space-2)',
    color: 'var(--color-error)',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
  },
  itemTotal: {
    textAlign: 'right',
  },
  itemTotalPrice: {
    fontSize: 'var(--text-base)',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
  },
  summary: {
    flex: '1 1 30%',
    minWidth: '280px',
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-card)',
    alignSelf: 'flex-start',
    position: 'sticky',
    top: 'calc(var(--navbar-height) + var(--space-4))',
  },
  summaryTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    marginBottom: 'var(--space-4)',
    paddingBottom: 'var(--space-3)',
    borderBottom: '1px solid var(--color-border)',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-3)',
  },
  summaryTotalRow: {
    borderTop: '1px solid var(--color-border)',
    paddingTop: 'var(--space-3)',
    marginTop: 'var(--space-1)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  totalPrice: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  shippingNote: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-warning)',
    marginBottom: 'var(--space-3)',
    marginTop: '-var(--space-2)',
  },
  checkoutBtn: {
    width: '100%',
    padding: 'var(--space-3)',
    fontSize: 'var(--text-base)',
    justifyContent: 'center',
    marginTop: 'var(--space-4)',
    textDecoration: 'none',
    display: 'flex',
  },
  continueShopping: {
    display: 'block',
    textAlign: 'center',
    marginTop: 'var(--space-3)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-primary)',
    fontWeight: 600,
    textDecoration: 'none',
  },
};

export default CartPage;
