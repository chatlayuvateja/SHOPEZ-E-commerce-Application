import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiLogOut, FiPackage, FiGrid, FiShield, FiMenu, FiX, FiSun, FiMoon, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [visible, setVisible] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 20);
      setVisible(current < lastScroll || current < 80);
      setLastScroll(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      searchRef.current?.blur();
    }
  }, [searchQuery, navigate]);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navVariants = {
    visible: { y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    hidden: { y: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <motion.nav
      variants={navVariants}
      animate={visible ? 'visible' : 'hidden'}
      style={{
        ...styles.nav,
        ...(scrolled ? styles.navScrolled : {}),
      }}
    >
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>✦</span>
          Shop<span style={styles.logoAccent}>EZ</span>
        </Link>

        <form style={styles.searchForm} onSubmit={handleSearch}>
          <div style={{
            ...styles.searchWrap,
            ...(searchFocused ? styles.searchWrapFocused : {}),
          }}>
            <FiSearch style={styles.searchIcon} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} style={styles.searchClear}>
                <FiX size={14} />
              </button>
            )}
          </div>
        </form>

        <div style={styles.actions}>
          <button onClick={toggleTheme} style={styles.themeBtn} aria-label="Toggle theme">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </motion.div>
          </button>

          <Link to="/cart" style={styles.cartBtn}>
            <FiShoppingCart size={20} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  style={styles.cartBadge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {isAuthenticated ? (
            <div ref={dropdownRef} style={styles.userMenu}>
              <button onClick={() => setShowDropdown(!showDropdown)} style={styles.userBtn}>
                <div style={styles.userAvatar}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
                <FiChevronDown size={14} style={{
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.3s',
                }} />
              </button>
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    style={styles.dropdown}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div style={styles.dropdownHeader}>
                      <div style={styles.dropdownAvatar}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={styles.dropdownName}>{user?.name}</p>
                        <p style={styles.dropdownEmail}>{user?.email}</p>
                      </div>
                    </div>
                    <div style={styles.dropdownDivider} />
                    <Link to="/my-orders" style={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                      <FiPackage size={16} /> My Orders
                    </Link>
                    {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                      <Link to="/seller/dashboard" style={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                        <FiGrid size={16} /> Seller Dashboard
                      </Link>
                    )}
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin/dashboard" style={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                        <FiShield size={16} /> Admin Panel
                      </Link>
                    )}
                    <div style={styles.dropdownDivider} />
                    <button onClick={handleLogout} style={styles.dropdownItem}>
                      <FiLogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/login" style={styles.loginBtn}>Log In</Link>
              <Link to="/register" style={styles.registerBtn}>Sign Up</Link>
            </div>
          )}

          <button style={styles.menuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            style={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form style={styles.mobileSearch} onSubmit={handleSearch}>
              <div style={styles.searchWrap}>
                <FiSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </form>
            <Link to="/cart" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
              <FiShoppingCart size={18} /> Cart {itemCount > 0 && `(${itemCount})`}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/my-orders" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                  <FiPackage size={18} /> My Orders
                </Link>
                {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                  <Link to="/seller/dashboard" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                    <FiGrid size={18} /> Seller Dashboard
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                    <FiShield size={18} /> Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} style={styles.mobileLink}>
                  <FiLogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                <Link to="/register" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
            <button onClick={toggleTheme} style={styles.mobileLink}>
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />} {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 'var(--navbar-height)',
    background: 'rgba(10, 10, 15, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    transition: 'background 0.3s, border-color 0.3s',
  },
  navScrolled: {
    background: 'rgba(10, 10, 15, 0.85)',
    borderBottom: '1px solid rgba(255, 107, 53, 0.15)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    gap: 'var(--space-6)',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    letterSpacing: '0.05em',
  },
  logoIcon: {
    color: 'var(--color-primary)',
    fontSize: '1.2em',
  },
  logoAccent: {
    color: 'var(--color-primary)',
  },
  searchForm: {
    flex: 1,
    maxWidth: '520px',
    position: 'relative',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 'var(--radius-full)',
    padding: '0 var(--space-4)',
    transition: 'all 0.3s',
    position: 'relative',
  },
  searchWrapFocused: {
    borderColor: 'var(--color-primary)',
    boxShadow: '0 0 20px rgba(255, 107, 53, 0.15)',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  searchIcon: {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--text-base)',
    flexShrink: 0,
  },
  searchInput: {
    width: '100%',
    padding: 'var(--space-2) var(--space-3)',
    border: 'none',
    background: 'transparent',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    outline: 'none',
  },
  searchClear: {
    color: 'var(--color-text-muted)',
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--space-1)',
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  themeBtn: {
    color: 'var(--color-text-secondary)',
    padding: 'var(--space-2)',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  cartBtn: {
    position: 'relative',
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--space-2)',
    transition: 'color 0.2s',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    lineHeight: 1,
    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.4)',
  },
  userMenu: {
    position: 'relative',
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-1) var(--space-3) var(--space-1) var(--space-1)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    transition: 'all 0.3s',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 'var(--text-sm)',
  },
  userName: {
    display: 'none',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '240px',
    background: 'rgba(20, 20, 30, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    zIndex: 1001,
    overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-4)',
  },
  dropdownAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 'var(--text-base)',
  },
  dropdownName: {
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  dropdownEmail: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.06)',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    transition: 'background 0.15s',
    width: '100%',
    textAlign: 'left',
    textDecoration: 'none',
    border: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
  },
  authBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  loginBtn: {
    padding: 'var(--space-2) var(--space-5)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textDecoration: 'none',
    transition: 'all 0.3s',
    background: 'rgba(255, 255, 255, 0.03)',
  },
  registerBtn: {
    padding: 'var(--space-2) var(--space-5)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: '#fff',
    borderRadius: 'var(--radius-full)',
    textDecoration: 'none',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
  },
  menuBtn: {
    display: 'none',
    color: 'var(--color-text-primary)',
    padding: 'var(--space-2)',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
  },
  mobileMenu: {
    padding: 'var(--space-4)',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(10, 10, 15, 0.95)',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  },
  mobileSearch: {
    marginBottom: 'var(--space-3)',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-2)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontFamily: 'inherit',
    borderRadius: 'var(--radius-sm)',
    transition: 'background 0.15s',
  },
};

export default Navbar;
