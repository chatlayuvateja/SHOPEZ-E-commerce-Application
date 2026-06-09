import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff, FiShoppingBag } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import parseAPIError from '../../utils/errorParser';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
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
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <Link to="/" style={styles.brand}>
            Shop<span style={{ color: 'var(--color-primary)' }}>EZ</span>
          </Link>
          <h2 style={styles.tagline}>Welcome Back!</h2>
          <p style={styles.subtext}>Log in to continue your shopping journey.</p>
          <FiShoppingBag size={80} style={styles.icon} />
        </div>
      </div>
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h1 style={styles.title}>Log In</h1>
          <p style={styles.subtitle}>Access your account</p>
          <form onSubmit={handleSubmit} style={styles.form}>
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
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{ ...styles.input, ...styles.passwordInput, ...(errors.password ? styles.inputError : {}) }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && <span style={styles.error}>{errors.password}</span>}
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={styles.submitBtn}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> : 'Log In'}
            </button>
          </form>
          <p style={styles.footerText}>
            Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: 'calc(100vh - var(--navbar-height) - 300px)',
  },
  leftPanel: {
    flex: '1 1 45%',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-8)',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    textAlign: 'center',
    color: '#fff',
    zIndex: 1,
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-3xl)',
    fontWeight: 700,
    color: '#fff',
    display: 'inline-block',
    marginBottom: 'var(--space-6)',
    textDecoration: 'none',
  },
  tagline: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 600,
    marginBottom: 'var(--space-3)',
  },
  subtext: {
    fontSize: 'var(--text-base)',
    opacity: 0.9,
    marginBottom: 'var(--space-8)',
  },
  icon: {
    opacity: 0.3,
  },
  rightPanel: {
    flex: '1 1 55%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-8)',
    backgroundColor: 'var(--color-bg-card)',
  },
  formContainer: {
    width: '100%',
    maxWidth: '420px',
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
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-8)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-5)',
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
    transition: 'border-color var(--transition-fast)',
    width: '100%',
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
    marginTop: 'var(--space-2)',
    minHeight: '48px',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    marginTop: 'var(--space-6)',
  },
  link: {
    color: 'var(--color-primary)',
    fontWeight: 600,
  },
};

export default LoginPage;
