import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiUserCheck, FiPackage, FiDollarSign, FiTrash2, FiToggleLeft, FiSearch, FiExternalLink } from '../../utils/Icons';
import adminAPI from '../../api/adminAPI';
import productAPI from '../../api/productAPI';
import Pagination from '../../components/common/Pagination';
import { RevenueTable, OrdersDonutTable } from '../../components/charts/SimpleCharts';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { useToast } from '../../components/common/Toast';
import { Link } from '../../router/Router';
import { formatINR } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import parseAPIError from '../../utils/errorParser';

const roleColors = {
  USER: { color: '#3B82F6', bg: '#DBEAFE' },
  SELLER: { color: '#F59E0B', bg: '#FEF3C7' },
  ADMIN: { color: '#EF4444', bg: '#FEE2E2' },
};

const AdminDashboardPage = () => {
  const showToast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [ordPage, setOrdPage] = useState(1);
  const [ordTotalPages, setOrdTotalPages] = useState(1);
  const [ordFilter, setOrdFilter] = useState('all');
  const [prodPage, setProdPage] = useState(1);
  const [prodTotalPages, setProdTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, usersData, ordsData, prodData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getUsers({ page: userPage, search: userSearch || undefined }),
        adminAPI.getOrders({ page: ordPage, status: ordFilter !== 'all' ? ordFilter : undefined }),
        productAPI.getAll({ page: prodPage, limit: 20 }),
      ]);
      setStats(statsData.stats);
      setUsers(usersData.users);
      setUserTotalPages(usersData.totalPages || 1);
      setOrders(ordsData.orders);
      setOrdTotalPages(ordsData.totalPages || 1);
      setAllProducts(prodData.products);
      setProdTotalPages(prodData.totalPages || 1);
    } catch (err) {
      setError(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  }, [userPage, userSearch, ordPage, ordFilter, prodPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleStatus = async (userId) => {
    setActionLoading(userId);
    try {
      const data = await adminAPI.updateUserStatus(userId);
      setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));
      showToast('User status updated', 'success');
    } catch (err) {
      showToast(parseAPIError(err), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      const data = await adminAPI.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));
      showToast(`Role changed to ${newRole}`, 'success');
    } catch (err) {
      showToast(parseAPIError(err), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteInit = (user) => {
    setDeleteTarget(user);
    setDeleteConfirmEmail('');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmEmail !== deleteTarget.email) {
      showToast('Email does not match. Please type the exact email to confirm.', 'error');
      return;
    }
    setActionLoading(deleteTarget._id);
    try {
      await adminAPI.deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
      showToast('User and all associated data permanently deleted', 'success');
    } catch (err) {
      showToast(parseAPIError(err), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleProductActive = async (product) => {
    try {
      await productAPI.update(product._id, { isActive: !product.isActive });
      showToast(`Product ${product.isActive ? 'deactivated' : 'activated'}`, 'success');
      setAllProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, isActive: !p.isActive } : p));
    } catch (err) {
      showToast(parseAPIError(err), 'error');
    }
  };

  if (error && !stats) {
    return (
      <div className="container" style={styles.page}>
        <p style={{ color: 'var(--color-error)', textAlign: 'center', padding: 'var(--space-8)' }}>{error}</p>
        <div style={{ textAlign: 'center' }}><button onClick={fetchData} className="btn-primary" style={{ padding: 'var(--space-2) var(--space-6)' }}>Retry</button></div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="container" style={styles.page}>
        <div className="page-loader"><div className="spinner"></div></div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'orders', label: 'Orders' },
    { key: 'products', label: 'Products' },
  ];

  const statusFilters = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="container" style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
      </div>

      <div style={styles.tabs}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div style={styles.statsGrid}>
            <div style={{ ...styles.statCard, borderLeftColor: 'var(--color-primary)' }}>
              <FiUsers size={24} style={{ color: 'var(--color-primary)' }} />
              <div style={styles.statInfo}><span style={styles.statValue}>{stats?.totalUsers || 0}</span><span style={styles.statLabel}>Total Users</span></div>
            </div>
            <div style={{ ...styles.statCard, borderLeftColor: '#8B5CF6' }}>
              <FiUserCheck size={24} style={{ color: '#8B5CF6' }} />
              <div style={styles.statInfo}><span style={styles.statValue}>{stats?.totalSellers || 0}</span><span style={styles.statLabel}>Total Sellers</span></div>
            </div>
            <div style={{ ...styles.statCard, borderLeftColor: '#3B82F6' }}>
              <FiPackage size={24} style={{ color: '#3B82F6' }} />
              <div style={styles.statInfo}><span style={styles.statValue}>{stats?.totalProducts || 0}</span><span style={styles.statLabel}>Total Products</span></div>
            </div>
            <div style={{ ...styles.statCard, borderLeftColor: 'var(--color-success)' }}>
              <FiDollarSign size={24} style={{ color: 'var(--color-success)' }} />
              <div style={styles.statInfo}><span style={styles.statValue}>{formatINR(stats?.totalRevenue || 0)}</span><span style={styles.statLabel}>Total Revenue</span></div>
            </div>
          </div>

          <div style={styles.chartsRow}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Revenue Overview</h3>
              <RevenueTable data={stats?.monthlyRevenue || []} title="Revenue" />
            </div>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Orders by Status</h3>
              <OrdersDonutTable data={stats?.ordersByStatus || []} title="Orders by Status" />
            </div>
          </div>

          {stats?.topProducts && stats.topProducts.length > 0 && (
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Top 5 Products by Revenue</h3>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead><tr>{['#', 'Product', 'Total Sold', 'Revenue'].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {stats.topProducts.map((tp, idx) => (
                      <tr key={tp._id || idx}>
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <img src={tp.images?.[0]?.url || 'https://via.placeholder.com/32'} alt="" style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                            <span style={{ fontWeight: 600 }}>{tp.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td style={styles.td}>{tp.totalSold || 0}</td>
                        <td style={styles.td}>{formatINR(tp.revenue || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>User Management</h3>
            <div style={styles.searchWrap}>
              <FiSearch size={16} style={{ color: 'var(--color-text-muted)' }} />
              <input
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                style={styles.searchInput}
              />
            </div>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>{['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
              <tbody>
                {users.map((u) => {
                  const rc = roleColors[u.role] || roleColors.USER;
                  return (
                    <tr key={u._id}>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, color: rc.color, backgroundColor: rc.bg }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusDot, backgroundColor: u.isActive ? '#10B981' : '#EF4444' }} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </td>
                      <td style={styles.td}>{formatDate(u.createdAt)}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u._id, e.target.value)}
                            disabled={actionLoading === u._id}
                            style={styles.roleSelect}
                          >
                            {['USER', 'SELLER', 'ADMIN'].map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <button onClick={() => handleToggleStatus(u._id)} disabled={actionLoading === u._id} style={styles.iconBtn} title={u.isActive ? 'Deactivate' : 'Activate'}>
                            {actionLoading === u._id ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <FiToggleLeft size={16} />}
                          </button>
                          <button onClick={() => handleDeleteInit(u)} disabled={actionLoading === u._id} style={{ ...styles.iconBtn, color: 'var(--color-error)' }} title="Delete">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={userPage} totalPages={userTotalPages} onPageChange={setUserPage} />
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>All Orders</h3>
            <div style={styles.filterTabs}>
              {statusFilters.map((sf) => (
                <button key={sf} onClick={() => { setOrdFilter(sf); setOrdPage(1); }} style={{ ...styles.filterTab, ...(ordFilter === sf ? styles.filterTabActive : {}) }}>
                  {sf.charAt(0).toUpperCase() + sf.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>{['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', ''].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
              <tbody>
                {orders.map((o) => {
                  const isExpanded = expandedOrderId === o._id;
                  return (
                    <React.Fragment key={o._id}>
                      <tr
                        onClick={() => setExpandedOrderId(isExpanded ? null : o._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={styles.td}><span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 'var(--text-xs)' }}>#{o._id.slice(-8).toUpperCase()}</span></td>
                        <td style={styles.td}>{o.user?.name || 'N/A'}</td>
                        <td style={styles.td}>{o.items?.length || 0}</td>
                        <td style={styles.td}>{formatINR(o.total)}</td>
                        <td style={styles.td}><OrderStatusBadge status={o.status} /></td>
                        <td style={styles.td}>{formatDate(o.createdAt)}</td>
                        <td style={styles.td}>{isExpanded ? '▲' : '▼'}</td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} style={{ padding: 'var(--space-4) var(--space-5)', backgroundColor: 'var(--color-border-light)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                              <div>
                                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>Customer</h4>
                                <p style={{ fontSize: 'var(--text-sm)' }}>{o.user?.name || 'N/A'}</p>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{o.user?.email || ''}</p>
                              </div>
                              <div>
                                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>Shipping</h4>
                                {o.shippingAddress?.fullName && <p style={{ fontSize: 'var(--text-sm)' }}>{o.shippingAddress.fullName}</p>}
                                <p style={{ fontSize: 'var(--text-sm)' }}>{o.shippingAddress?.street}</p>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{o.shippingAddress?.city}, {o.shippingAddress?.state} {o.shippingAddress?.zipCode}</p>
                              </div>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>Items</h4>
                                {o.items?.map((item, idx) => {
                                  const product = item.product || {};
                                  return (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
                                      <img src={product.images?.[0]?.url || 'https://via.placeholder.com/36'} alt="" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                                      <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{product.name || 'Product'}</span>
                                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>×{item.quantity}</span>
                                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{formatINR(item.price * item.quantity)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {orders.length === 0 && (
                  <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={ordPage} totalPages={ordTotalPages} onPageChange={setOrdPage} />
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <h3 style={styles.sectionTitle}>All Products ({allProducts.length})</h3>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>{['Image', 'Name', 'Category', 'Price', 'Stock', 'Seller', 'Status', 'Actions'].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
              <tbody>
                {allProducts.map((p) => (
                  <tr key={p._id}>
                    <td style={styles.td}><img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} /></td>
                    <td style={styles.td}><span style={{ fontWeight: 600 }}>{p.name}</span></td>
                    <td style={{ ...styles.td, textTransform: 'capitalize' }}>{p.category}</td>
                    <td style={styles.td}>{formatINR(p.finalPrice)}</td>
                    <td style={styles.td}>{p.stock}</td>
                    <td style={styles.td}>{p.seller?.name || 'Unknown'}</td>
                    <td style={styles.td}>{p.isActive ? <span style={{ color: '#10B981' }}>Active</span> : <span style={{ color: '#EF4444' }}>Inactive</span>}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                        <button onClick={() => handleToggleProductActive(p)} style={styles.iconBtn} title={p.isActive ? 'Deactivate' : 'Activate'}>
                          <FiToggleLeft size={16} />
                        </button>
                        {p.slug && (
                          <Link to={`/products/${p.slug}`} style={styles.iconBtn} title="View Product">
                            <FiExternalLink size={16} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {allProducts.length === 0 && (
                  <tr><td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={prodPage} totalPages={prodTotalPages} onPageChange={setProdPage} />
        </div>
      )}

      {showDeleteModal && deleteTarget && (
        <div style={styles.overlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', color: 'var(--color-error)' }}>
              <FiTrash2 size={24} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>Delete User</h3>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
              This will permanently delete <strong>{deleteTarget.name}</strong> and all their data. This cannot be undone.
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Type <strong>{deleteTarget.email}</strong> to confirm:
            </p>
            <input
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
              placeholder={deleteTarget.email}
              style={{ ...styles.input, marginBottom: 'var(--space-4)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn-ghost" style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)' }}>Cancel</button>
              <button onClick={handleDeleteConfirm} className="btn-primary" disabled={deleteConfirmEmail !== deleteTarget.email || actionLoading === deleteTarget._id} style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)', backgroundColor: 'var(--color-error)' }}>
                {actionLoading === deleteTarget._id ? 'Deleting...' : 'Permanently Delete'}
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
  header: { marginBottom: 'var(--space-6)' },
  title: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600 },
  tabs: { display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' },
  tab: { padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: '-1px' },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' },
  statCard: { display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5)', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', borderLeft: '4px solid' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statValue: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' },
  statLabel: { fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' },
  chartsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' },
  chartCard: { backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-card)', marginBottom: 'var(--space-6)' },
  chartTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-card)', minWidth: 240 },
  searchInput: { border: 'none', outline: 'none', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', backgroundColor: 'transparent', flex: 1, fontFamily: 'inherit' },
  filterTabs: { display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' },
  filterTab: { padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-secondary)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', cursor: 'pointer' },
  filterTabActive: { color: 'var(--color-primary)', borderColor: 'var(--color-primary)', backgroundColor: 'rgba(255,107,53,0.06)' },
  tableWrap: { overflowX: 'auto', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' },
  th: { textAlign: 'left', padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '2px solid var(--color-border)', backgroundColor: 'var(--color-border-light)', textTransform: 'uppercase', fontSize: 'var(--text-xs)', letterSpacing: '0.05em', whiteSpace: 'nowrap' },
  td: { padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-primary)' },
  statusDot: { display: 'inline-block', width: 8, height: 8, borderRadius: 'var(--radius-full)', marginRight: 'var(--space-1)' },
  roleSelect: { padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer' },
  iconBtn: { padding: 'var(--space-1)', cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' },
  modal: { backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', width: '100%', maxWidth: 480 },
  input: { width: '100%', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' },
};

export default AdminDashboardPage;
