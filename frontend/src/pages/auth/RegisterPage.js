import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import ParticlesBackground from '../../components/3d/ParticlesBackground';
import toast from 'react-hot-toast';
import parseAPIError from '../../utils/errorParser';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [roleSelection, setRoleSelection] = useState(false);
  const [role, setRole] = useState('USER');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
        await register(form.name, form.email, form.password, role);
        toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <ParticlesBackground count={50} color="255,107,53" speed={0.2} />
      <div style={styles.panel}>
        <motion.div
          style={styles.formContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={styles.header}>
            <Link to="/" style={styles.brand}>
              <span style={styles.logoIcon}>✦</span>
              Shop<span style={{ color: 'var(--color-primary)' }}>EZ</span>
            </Link>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>Join ShopEZ and start shopping</p>
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
            {!roleSelection ? (
              <button type="button" onClick={() => setRoleSelection(true)} style={styles.roleBtn}>
                Register as Customer
              </button>
            ) : (
              <div style={styles.roleSelection}>
                <p style={styles.roleLabel}>I want to register as:</p>
                <div style={styles.roleOptions}>
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    style={{ ...styles.roleOption, ...(role === 'USER' ? styles.roleOptionActive : {}) }}
                  >
                    <span style={styles.roleIcon}>🛒</span>
                    <span style={styles.roleName}>Customer</span>
                    <span style={styles.roleDesc}>Browse & shop products</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('SELLER')}
                    style={{ ...styles.roleOption, ...(role === 'SELLER' ? styles.roleOptionActive : {}) }}
                  >
                    <span style={styles.roleIcon}>🏪</span>
                    <span style={styles.roleName}>Seller</span>
                    <span style={styles.roleDesc}>Sell your products</span>
                  </button>
                </div>
              </div>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> : 'Create Account'}
            </motion.button>
          </form>
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account? <Link to="/login" style={styles.link}>Log In</Link>
            </p>
            <Link to="/" style={styles.backLink}>
              <FiStar size={12} /> Back to Home
            </Link>
          </div>
        </motion.div>
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
    maxWidth: '480px',
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
  roleBtn: {
    width: '100%',
    padding: 'var(--space-3)',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'inherit',
  },
  roleSelection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  roleLabel: {
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    textAlign: 'center',
  },
  roleOptions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-3)',
  },
  roleOption: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-4) var(--space-3)',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'inherit',
  },
  roleOptionActive: {
    borderColor: 'var(--color-primary)',
    background: 'rgba(255, 107, 53, 0.08)',
    boxShadow: '0 0 20px rgba(255, 107, 53, 0.1)',
  },
  roleIcon: {
    fontSize: 'var(--text-2xl)',
  },
  roleName: {
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  roleDesc: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
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
