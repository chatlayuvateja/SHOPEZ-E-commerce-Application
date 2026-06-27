import React, { useState } from 'react';
import { Link, useNavigate } from '../../router/Router';
import { FiEye, FiEyeOff, FiStar } from '../../utils/Icons';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import parseAPIError from '../../utils/errorParser';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.phone) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter valid 10-digit phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, accountType === 'seller' ? 'SELLER' : 'USER');
      showToast('Registration successful!', 'success');
      navigate(accountType === 'seller' ? '/seller/dashboard' : '/');
    } catch (err) {
      showToast(parseAPIError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!accountType) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.panel}>
          <div className="fade-in-up" style={styles.formContainer}>
            <div style={styles.header}>
              <Link to="/" style={styles.brand}>
                <span style={styles.logoIcon}>✦</span>
                Shop<span style={{ color: 'var(--color-primary)' }}>EZ</span>
              </Link>
              <h1 style={styles.title}>Join ShopEZ</h1>
              <p style={styles.subtitle}>Choose your account type to get started</p>
            </div>
            <div style={styles.accountOptions}>
              <button onClick={() => setAccountType('customer')} style={styles.accountCard}>
                <span style={styles.accountIcon}>🛒</span>
                <span style={styles.accountName}>Customer Account</span>
                <span style={styles.accountDesc}>Browse products, add to cart, place orders, and track deliveries.</span>
              </button>
              <button onClick={() => setAccountType('seller')} style={styles.accountCard}>
                <span style={styles.accountIcon}>🏪</span>
                <span style={styles.accountName}>Seller Account</span>
                <span style={styles.accountDesc}>List products, manage inventory, track sales and earnings.</span>
              </button>
            </div>
            <div style={styles.footer}>
              <p style={styles.footerText}>
                Already have an account? <Link to="/login" style={styles.link}>Log In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.panel}>
        <div className="fade-in-up" style={styles.formContainer}>
          <div style={styles.header}>
            <Link to="/" style={styles.brand}>
              <span style={styles.logoIcon}>✦</span>
              Shop<span style={{ color: 'var(--color-primary)' }}>EZ</span>
            </Link>
            <h1 style={styles.title}>
              {accountType === 'seller' ? 'Seller Registration' : 'Customer Registration'}
            </h1>
            <p style={styles.subtitle}>
              {accountType === 'seller'
                ? 'Create your seller account to start selling on ShopEZ'
                : 'Create your customer account to start shopping'}
            </p>
            <button onClick={() => setAccountType(null)} style={styles.backBtn}>← Change account type</button>
          </div>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
              />
              {errors.name && <span style={styles.error}>{errors.name}</span>}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
              />
              {errors.email && <span style={styles.error}>{errors.email}</span>}
            </div>
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrap}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 chars"
                    style={{ ...styles.input, ...styles.passwordInput, ...(errors.password ? styles.inputError : {}) }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && <span style={styles.error}>{errors.password}</span>}
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  style={{ ...styles.input, ...(errors.confirmPassword ? styles.inputError : {}) }}
                />
                {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="1234567890"
                style={{ ...styles.input, ...(errors.phone ? styles.inputError : {}) }}
              />
              {errors.phone && <span style={styles.error}>{errors.phone}</span>}
            </div>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> : 'Create Account'}
            </button>
          </form>
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account? <Link to="/login" style={styles.link}>Log In</Link>
            </p>
            <Link to="/" style={styles.backLink}>
              <FiStar size={12} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - var(--navbar-height))',
    padding: 'var(--space-6)',
    position: 'relative',
    overflow: 'hidden',
  },
  panel: {
    width: '100%',
    maxWidth: '520px',
    position: 'relative',
    zIndex: 1,
  },
  formContainer: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-8)',
    boxShadow: 'var(--glass-shadow)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 'var(--space-8)',
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    marginBottom: 'var(--space-4)',
    textDecoration: 'none',
    letterSpacing: '0.03em',
  },
  logoIcon: {
    color: 'var(--color-primary)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-3xl)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-1)',
  },
  subtitle: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-2)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    cursor: 'pointer',
    fontSize: 'var(--text-xs)',
    fontFamily: 'inherit',
    padding: 0,
  },
  accountOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  },
  accountCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--space-2)',
    padding: 'var(--space-6)',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'inherit',
    textAlign: 'left',
    width: '100%',
  },
  accountIcon: {
    fontSize: 'var(--text-3xl)',
  },
  accountName: {
    fontSize: 'var(--text-lg)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
  },
  accountDesc: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  },
  row: {
    display: 'flex',
    gap: 'var(--space-4)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  },
  label: {
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  input: {
    padding: 'var(--space-3) var(--space-4)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
    transition: 'all 0.2s',
    width: '100%',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-primary)',
  },
  inputError: {
    borderColor: 'var(--color-error)',
  },
  passwordWrap: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: '44px',
  },
  eyeBtn: {
    position: 'absolute',
    right: 'var(--space-3)',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
  },
  error: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-error)',
  },
  submitBtn: {
    width: '100%',
    padding: 'var(--space-3)',
    fontSize: 'var(--text-base)',
    minHeight: '48px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 'var(--radius-full)',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
    fontFamily: 'inherit',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    marginTop: 'var(--space-2)',
  },
  footer: {
    textAlign: 'center',
    marginTop: 'var(--space-6)',
  },
  footerText: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-2)',
  },
  link: {
    color: 'var(--color-primary)',
    fontWeight: 600,
    textDecoration: 'none',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    textDecoration: 'none',
    fontFamily: 'var(--font-mono)',
  },
};

export default RegisterPage;
