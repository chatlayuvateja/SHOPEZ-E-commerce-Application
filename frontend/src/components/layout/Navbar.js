import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiLogOut, FiPackage, FiGrid, FiShield, FiMenu, FiX } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          Shop<span style={styles.logoAccent}>EZ</span>
        </Link>

        <form style={styles.searchForm} onSubmit={handleSearch}>
          <FiSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </form>

        <div style={styles.actions}>
          <Link to="/cart" style={styles.cartBtn}>
            <FiShoppingCart size={22} />
            {itemCount > 0 && <span style={styles.cartBadge}>{itemCount > 99 ? '99+' : itemCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div ref={dropdownRef} style={styles.userMenu}>
              <button onClick={() => setShowDropdown(!showDropdown)} style={styles.userBtn}>
                <FiUser size={20} />
                <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
              </button>
              {showDropdown && (
                <div style={styles.dropdown}>
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
                  <button onClick={handleLogout} style={styles.dropdownItem}>
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/login" className="btn-ghost" style={styles.loginBtn}>Log In</Link>
              <Link to="/register" className="btn-primary" style={styles.registerBtn}>Sign Up</Link>
            </div>
          )}

          <button style={styles.menuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <form style={styles.mobileSearch} onSubmit={handleSearch}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </form>
          <Link to="/cart" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
            <FiShoppingCart size={18} /> Cart
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
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--color-border)',
    height: 'var(--navbar-height)',
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
    color: 'var(--color-secondary)',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  },
  logoAccent: {
    color: 'var(--color-primary)',
  },
  searchForm: {
    flex: 1,
    maxWidth: '480px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 'var(--space-3)',
    color: 'var(--color-text-muted)',
    fontSize: 'var(--text-lg)',
  },
  searchInput: {
    width: '100%',
    padding: 'var(--space-2) var(--space-4) var(--space-2) var(--space-10)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-sm)',
    backgroundColor: 'var(--color-bg)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
  },
  cartBtn: {
    position: 'relative',
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--space-2)',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-white)',
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
  },
  userMenu: {
    position: 'relative',
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    cursor: 'pointer',
  },
  userName: {
    display: 'none',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 'var(--space-2)',
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '200px',
    zIndex: 1001,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast)',
    width: '100%',
    textAlign: 'left',
    textDecoration: 'none',
  },
  authBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  loginBtn: {
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--text-sm)',
  },
  registerBtn: {
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--text-sm)',
  },
  menuBtn: {
    display: 'none',
    color: 'var(--color-text-primary)',
    padding: 'var(--space-2)',
  },
  mobileMenu: {
    display: 'none',
    padding: 'var(--space-4)',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-card)',
  },
  mobileSearch: {
    display: 'none',
    position: 'relative',
    marginBottom: 'var(--space-4)',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) 0',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    borderBottom: '1px solid var(--color-border-light)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    textDecoration: 'none',
  },
};

export default Navbar;
