import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiCheckCircle, FiArrowLeft, FiArrowRight, FiSmartphone, FiDollarSign } from 'react-icons/fi';
import cartAPI from '../api/cartAPI';
import orderAPI from '../api/orderAPI';
import useAuth from '../hooks/useAuth';
import ErrorState from '../components/common/ErrorState';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/formatCurrency';
import parseAPIError from '../utils/errorParser';

const steps = [
  { key: 'address', label: 'Delivery Address', icon: FiMapPin },
  { key: 'payment', label: 'Payment Method', icon: FiCreditCard },
  { key: 'review', label: 'Review & Place', icon: FiCheckCircle },
];

const paymentMethods = [
  { value: 'cod', label: 'Cash on Delivery', icon: FiDollarSign, description: 'Pay when your order is delivered' },
  { value: 'upi', label: 'UPI', icon: FiSmartphone, description: 'Google Pay, PhonePe, Paytm & more' },
  { value: 'card', label: 'Credit/Debit Card', icon: FiCreditCard, description: 'Visa, Mastercard, RuPay & more' },
  { value: 'netbanking', label: 'Net Banking', icon: FiDollarSign, description: 'All major banks supported' },
];

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartAPI.getCart();
      setCart(data.cart);
    } catch (err) {
      setError(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
    if (addressErrors[name]) {
      setAddressErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateAddress = () => {
    const errors = {};
    if (!addressForm.fullName.trim()) errors.fullName = 'Full name is required';
    if (!addressForm.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(addressForm.phone.replace(/\D/g, ''))) errors.phone = 'Enter a valid 10-digit phone number';
    if (!addressForm.street.trim()) errors.street = 'Street address is required';
    if (!addressForm.city.trim()) errors.city = 'City is required';
    if (!addressForm.state.trim()) errors.state = 'State is required';
    if (!addressForm.zipCode.trim()) errors.zipCode = 'PIN code is required';
    else if (!/^\d{6}$/.test(addressForm.zipCode)) errors.zipCode = 'Enter a valid 6-digit PIN code';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleCardChange = (field, value) => {
    if (field === 'number') value = formatCardNumber(value);
    if (field === 'expiry') value = formatExpiry(value);
    if (field === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);
    setCardDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 0 && validateAddress()) setStep(1);
    else if (step === 1) setStep(2);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const orderData = {
        shippingAddress: {
          fullName: addressForm.fullName,
          street: addressForm.street,
          city: addressForm.city,
          state: addressForm.state,
          zipCode: addressForm.zipCode,
          country: addressForm.country,
        },
        phone: addressForm.phone,
        paymentMethod,
        ...(paymentMethod === 'upi' && { upiId }),
        ...(paymentMethod === 'card' && {
          cardLastFour: cardDetails.number.replace(/\s/g, '').slice(-4),
        }),
      };
      const data = await orderAPI.create(orderData);
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${data.order._id}`);
    } catch (err) {
      const msg = parseAPIError(err);
      toast.error(msg);
      if (msg.toLowerCase().includes('stock')) {
        fetchCart();
      }
    } finally {
      setSubmitting(false);
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
        <ErrorState message={error} onRetry={fetchCart} />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => {
    const price = item.priceAtAdd || item.product?.finalPrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container" style={styles.page}>
      <h1 style={styles.pageTitle}>Checkout</h1>

      <div style={styles.progress}>
        {steps.map((s, idx) => (
          <React.Fragment key={s.key}>
            <div style={{ ...styles.step, ...(idx <= step ? styles.stepActive : {}), ...(idx < step ? styles.stepCompleted : {}) }}>
              <div style={styles.stepDot}>
                {idx < step ? <FiCheckCircle size={16} /> : <span>{idx + 1}</span>}
              </div>
              <span style={styles.stepLabel}>{s.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ ...styles.stepLine, ...(idx < step ? styles.stepLineActive : {}) }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={styles.layout}>
        <div style={styles.formSection}>
          {step === 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}><FiMapPin size={18} /> Delivery Address</h3>
              <div style={styles.grid}>
                <div style={styles.fieldFull}>
                  <label style={styles.label}>Full Name</label>
                  <input name="fullName" value={addressForm.fullName} onChange={handleAddressChange} style={{ ...styles.input, ...(addressErrors.fullName ? styles.inputError : {}) }} placeholder="John Doe" />
                  {addressErrors.fullName && <span style={styles.fieldError}>{addressErrors.fullName}</span>}
                </div>
                <div style={styles.fieldFull}>
                  <label style={styles.label}>Phone Number</label>
                  <input name="phone" value={addressForm.phone} onChange={handleAddressChange} style={{ ...styles.input, ...(addressErrors.phone ? styles.inputError : {}) }} placeholder="9876543210" />
                  {addressErrors.phone && <span style={styles.fieldError}>{addressErrors.phone}</span>}
                </div>
                <div style={styles.fieldFull}>
                  <label style={styles.label}>Street Address</label>
                  <input name="street" value={addressForm.street} onChange={handleAddressChange} style={{ ...styles.input, ...(addressErrors.street ? styles.inputError : {}) }} placeholder="123 Main Street, Apartment 4B" />
                  {addressErrors.street && <span style={styles.fieldError}>{addressErrors.street}</span>}
                </div>
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>City</label>
                  <input name="city" value={addressForm.city} onChange={handleAddressChange} style={{ ...styles.input, ...(addressErrors.city ? styles.inputError : {}) }} placeholder="Mumbai" />
                  {addressErrors.city && <span style={styles.fieldError}>{addressErrors.city}</span>}
                </div>
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>State</label>
                  <input name="state" value={addressForm.state} onChange={handleAddressChange} style={{ ...styles.input, ...(addressErrors.state ? styles.inputError : {}) }} placeholder="Maharashtra" />
                  {addressErrors.state && <span style={styles.fieldError}>{addressErrors.state}</span>}
                </div>
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>PIN Code</label>
                  <input name="zipCode" value={addressForm.zipCode} onChange={handleAddressChange} style={{ ...styles.input, ...(addressErrors.zipCode ? styles.inputError : {}) }} placeholder="400001" />
                  {addressErrors.zipCode && <span style={styles.fieldError}>{addressErrors.zipCode}</span>}
                </div>
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>Country</label>
                  <input name="country" value={addressForm.country} onChange={handleAddressChange} style={styles.input} placeholder="India" />
                </div>
              </div>
              <div style={styles.cardActions}>
                <button onClick={handleNext} className="btn-primary" style={styles.actionBtn}>
                  Continue to Payment <FiArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}><FiCreditCard size={18} /> Payment Method</h3>
              <div style={styles.paymentOptions}>
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.value}
                    style={{
                      ...styles.paymentCard,
                      ...(paymentMethod === pm.value ? styles.paymentCardActive : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.value}
                      checked={paymentMethod === pm.value}
                      onChange={() => setPaymentMethod(pm.value)}
                      style={{ display: 'none' }}
                    />
                    <pm.icon size={24} style={{ color: paymentMethod === pm.value ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                    <div style={{ flex: 1 }}>
                      <span style={styles.paymentLabel}>{pm.label}</span>
                      <span style={styles.paymentDesc}>{pm.description}</span>
                    </div>
                    <div style={{ ...styles.radio, ...(paymentMethod === pm.value ? styles.radioActive : {}) }} />
                  </label>
                ))}
              </div>

              {paymentMethod === 'upi' && (
                <div style={styles.paymentDetail}>
                  <label style={styles.label}>UPI ID (e.g., name@upi)</label>
                  <input value={upiId} onChange={(e) => setUpiId(e.target.value)} style={styles.input} placeholder="example@paytm" />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div style={styles.paymentDetail}>
                  <div style={styles.cardPreview}>
                    <div style={styles.cardPreviewInner}>
                      <div style={styles.cardPreviewTop}>
                        <span style={styles.cardPreviewBrand}>{cardDetails.name || 'Your Name'}</span>
                        <span style={styles.cardPreviewChip}>●</span>
                      </div>
                      <div style={styles.cardPreviewNumber}>
                        {cardDetails.number || '•••• •••• •••• ••••'}
                      </div>
                      <div style={styles.cardPreviewBottom}>
                        <span>{cardDetails.expiry || 'MM/YY'}</span>
                        <span>{cardDetails.cvv ? '•••' : 'CVV'}</span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.grid}>
                    <div style={styles.fieldFull}>
                      <label style={styles.label}>Cardholder Name</label>
                      <input value={cardDetails.name} onChange={(e) => handleCardChange('name', e.target.value)} style={styles.input} placeholder="John Doe" />
                    </div>
                    <div style={styles.fieldFull}>
                      <label style={styles.label}>Card Number</label>
                      <input value={cardDetails.number} onChange={(e) => handleCardChange('number', e.target.value)} style={styles.input} placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div style={styles.fieldHalf}>
                      <label style={styles.label}>Expiry</label>
                      <input value={cardDetails.expiry} onChange={(e) => handleCardChange('expiry', e.target.value)} style={styles.input} placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div style={styles.fieldHalf}>
                      <label style={styles.label}>CVV</label>
                      <input type="password" value={cardDetails.cvv} onChange={(e) => handleCardChange('cvv', e.target.value)} style={styles.input} placeholder="•••" maxLength={4} />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div style={styles.codNotice}>
                  <FiDollarSign size={20} />
                  <span>You'll pay {formatINR(total)} when your order is delivered. Keep cash or card handy.</span>
                </div>
              )}

              <div style={styles.cardActions}>
                <button onClick={handlePrev} className="btn-ghost" style={styles.actionBtn}>
                  <FiArrowLeft size={16} /> Back to Address
                </button>
                <button onClick={handleNext} className="btn-primary" style={styles.actionBtn}>
                  Continue to Review <FiArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}><FiCheckCircle size={18} /> Review Your Order</h3>

              <div style={styles.reviewSection}>
                <h4 style={styles.reviewTitle}>Delivery Address</h4>
                <p style={styles.reviewText}>{addressForm.fullName}</p>
                <p style={styles.reviewText}>{addressForm.street}</p>
                <p style={styles.reviewText}>{addressForm.city}, {addressForm.state} {addressForm.zipCode}</p>
                <p style={styles.reviewText}>{addressForm.country}</p>
                <p style={styles.reviewText}>Phone: {addressForm.phone}</p>
              </div>

              <div style={styles.reviewSection}>
                <h4 style={styles.reviewTitle}>Payment Method</h4>
                <p style={styles.reviewText}>
                  {paymentMethods.find((pm) => pm.value === paymentMethod)?.label}
                  {paymentMethod === 'upi' && upiId && ` — ${upiId}`}
                  {paymentMethod === 'card' && cardDetails.number && ` — •••• ${cardDetails.number.replace(/\s/g, '').slice(-4)}`}
                </p>
              </div>

              <div style={styles.reviewSection}>
                <h4 style={styles.reviewTitle}>Items ({items.length})</h4>
                {items.map((item) => {
                  const p = item.product || {};
                  const price = item.priceAtAdd || p.finalPrice || p.price || 0;
                  const img = p.images?.[0]?.url || 'https://via.placeholder.com/48';
                  return (
                    <div key={item._id || p._id} style={styles.reviewItem}>
                      <img src={img} alt={p.name} style={styles.reviewItemImg} />
                      <div style={styles.reviewItemInfo}>
                        <p style={styles.reviewItemName}>{p.name || 'Product'}</p>
                        <p style={styles.reviewItemQty}>Qty: {item.quantity}</p>
                      </div>
                      <span style={styles.reviewItemTotal}>{formatINR(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div style={styles.cardActions}>
                <button onClick={handlePrev} className="btn-ghost" style={styles.actionBtn}>
                  <FiArrowLeft size={16} /> Back to Payment
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.summary}>
          <h3 style={styles.summaryTitle}>Order Summary</h3>
          <div style={styles.summaryRow}><span>Items Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div style={styles.summaryRow}><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'var(--color-success)' }}>FREE</span> : formatINR(shipping)}</span></div>
          {shipping > 0 && <p style={styles.shippingHint}>Add {formatINR(999 - subtotal)} more for free shipping!</p>}
          <div style={styles.summaryRow}><span>Tax (18% GST)</span><span>{formatINR(tax)}</span></div>
          <div style={{ ...styles.summaryRow, ...styles.totalRow }}><span>Total</span><span style={styles.totalPrice}>{formatINR(total)}</span></div>

          {step === 2 && (
            <button
              onClick={handleSubmit}
              className="btn-primary"
              style={styles.placeOrderBtn}
              disabled={submitting}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: '#fff transparent transparent' }} />
                  Placing Order...
                </span>
              ) : (
                `Place Order — ${formatINR(total)}`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, marginBottom: 'var(--space-6)' },
  progress: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' },
  step: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', opacity: 0.5 },
  stepActive: { opacity: 1 },
  stepCompleted: { opacity: 1 },
  stepDot: { width: 28, height: 28, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 600, backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)' },
  stepLabel: { fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'none', '@media (min-width: 640px)': { display: 'inline' } },
  stepLine: { width: 40, height: 2, backgroundColor: 'var(--color-border)', borderRadius: '1px' },
  stepLineActive: { backgroundColor: 'var(--color-primary)' },
  layout: { display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', alignItems: 'flex-start' },
  formSection: { flex: '1 1 60%', minWidth: '300px' },
  card: { backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-card)' },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' },
  fieldFull: { flex: '1 1 100%' },
  fieldHalf: { flex: '1 1 calc(50% - var(--space-2))', minWidth: '160px' },
  label: { display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' },
  input: { width: '100%', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color var(--transition-fast)', boxSizing: 'border-box' },
  inputError: { borderColor: 'var(--color-error)' },
  fieldError: { display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: '4px' },
  cardActions: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)', flexWrap: 'wrap' },
  actionBtn: { padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)', textDecoration: 'none' },
  paymentOptions: { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' },
  paymentCard: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all var(--transition-fast)' },
  paymentCardActive: { borderColor: 'var(--color-primary)', backgroundColor: 'rgba(255, 107, 53, 0.04)' },
  paymentLabel: { display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' },
  paymentDesc: { display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' },
  radio: { width: 18, height: 18, borderRadius: 'var(--radius-full)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioActive: { borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary)', boxShadow: 'inset 0 0 0 3px #fff' },
  paymentDetail: { marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' },
  cardPreview: { marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D5E 100%)', padding: 'var(--space-5)', color: '#fff' },
  cardPreviewInner: { display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' },
  cardPreviewTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardPreviewBrand: { fontSize: 'var(--text-sm)', fontWeight: 600, opacity: 0.8 },
  cardPreviewChip: { fontSize: '24px', opacity: 0.6 },
  cardPreviewNumber: { fontSize: 'var(--text-lg)', letterSpacing: '2px', fontFamily: 'monospace' },
  cardPreviewBottom: { display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--text-xs)', opacity: 0.7, fontFamily: 'monospace' },
  codNotice: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: '#92400E' },
  reviewSection: { marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' },
  reviewTitle: { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  reviewText: { fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.6 },
  reviewItem: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0' },
  reviewItemImg: { width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 },
  reviewItemInfo: { flex: 1 },
  reviewItemName: { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' },
  reviewItemQty: { fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' },
  reviewItemTotal: { fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-display)' },
  summary: { flex: '1 1 30%', minWidth: '280px', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-card)', position: 'sticky', top: 'calc(var(--navbar-height) + var(--space-4))' },
  summaryTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' },
  totalRow: { borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-1)', color: 'var(--color-text-primary)', fontWeight: 600 },
  totalPrice: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-primary)' },
  shippingHint: { fontSize: 'var(--text-xs)', color: 'var(--color-warning)', marginBottom: 'var(--space-3)', marginTop: '-var(--space-2)' },
  placeOrderBtn: { width: '100%', padding: 'var(--space-3)', fontSize: 'var(--text-base)', justifyContent: 'center', marginTop: 'var(--space-6)', border: 'none', cursor: 'pointer' },
};

export default CheckoutPage;
