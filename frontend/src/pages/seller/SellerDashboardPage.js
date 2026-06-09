import React, { useState, useEffect, useCallback } from 'react';
import { FiPackage, FiShoppingBag, FiDollarSign, FiStar, FiPlus, FiEdit2, FiTrash2, FiToggleLeft } from 'react-icons/fi';
import sellerAPI from '../../api/sellerAPI';
import productAPI from '../../api/productAPI';
import Pagination from '../../components/common/Pagination';
import RevenueChart from '../../components/charts/RevenueChart';
import OrdersDonutChart from '../../components/charts/OrdersDonutChart';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import parseAPIError from '../../utils/errorParser';

const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const SellerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [prodPage, setProdPage] = useState(1);
  const [prodTotalPages, setProdTotalPages] = useState(1);
  const [ordPage, setOrdPage] = useState(1);
  const [ordTotalPages, setOrdTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', discountPercent: '', category: 'electronics', stock: '', brand: '', isFeatured: false, images: ['', '', '', '', ''],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, prodData, ordData] = await Promise.all([
        sellerAPI.getStats(),
        sellerAPI.getProducts({ page: prodPage }),
        sellerAPI.getOrders({ page: ordPage, status: orderStatusFilter !== 'all' ? orderStatusFilter : undefined }),
      ]);
      setStats(statsData.stats);
      setProducts(prodData.products);
      setProdTotalPages(prodData.totalPages || 1);
      setOrders(ordData.orders);
      setOrdTotalPages(ordData.totalPages || 1);
    } catch (err) {
      setError(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  }, [prodPage, ordPage, orderStatusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setProductForm({ name: '', description: '', price: '', discountPercent: '', category: 'electronics', stock: '', brand: '', isFeatured: false, images: ['', '', '', '', ''] });
    setEditingProduct(null);
  };

  const openEditDrawer = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discountPercent: product.discountPercent?.toString() || '',
      category: product.category,
      stock: product.stock.toString(),
      brand: product.brand || '',
      isFeatured: product.isFeatured || false,
      images: product.images?.length ? product.images.map((img) => typeof img === 'string' ? img : img.url).concat(['', '', '', '', '']).slice(0, 5) : ['', '', '', '', ''],
    });
    setShowDrawer(true);
  };

  const handleImageChange = (idx, value) => {
    setProductForm((prev) => {
      const imgs = [...prev.images];
      imgs[idx] = value;
      return { ...prev, images: imgs };
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        discountPercent: productForm.discountPercent ? parseFloat(productForm.discountPercent) : 0,
        stock: parseInt(productForm.stock, 10),
        images: productForm.images.filter(Boolean).map((url) => ({ url })),
      };
      if (editingProduct) {
        await productAPI.update(editingProduct._id, payload);
        toast.success('Product updated');
      } else {
        await productAPI.create(payload);
        toast.success('Product created');
      }
      setShowDrawer(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(parseAPIError(err));
    } finally {
      setSavingProduct(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await productAPI.update(product._id, { isActive: !product.isActive });
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
      fetchData();
    } catch (err) {
      toast.error(parseAPIError(err));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchData();
    } catch (err) {
      toast.error(parseAPIError(err));
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(`${orderId}-${newStatus}`);
    try {
      const data = await sellerAPI.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error(parseAPIError(err));
    } finally {
      setUpdatingStatus(null);
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

  const revenueData = stats?.monthlyRevenue || [];
  const orderStatusData = stats?.ordersByStatus || [];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'products', label: 'My Products' },
    { key: 'orders', label: 'Incoming Orders' },
  ];

  const statusFilters = ['all', 'pending', 'confirmed', 'shipped', 'delivered'];

  const safeStatusUpdate = (orderId, currentStatus, newStatus) => {
    const allowed = STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      toast.error(`Cannot move from ${currentStatus} to ${newStatus}`);
      return;
    }
    handleStatusUpdate(orderId, newStatus);
  };

  return (
    <div className="container" style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Seller Dashboard</h1>
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
              <FiPackage size={24} style={{ color: 'var(--color-primary)' }} />
              <div style={styles.statInfo}><span style={styles.statValue}>{stats?.totalProducts || 0}</span><span style={styles.statLabel}>Total Products</span></div>
            </div>
            <div style={{ ...styles.statCard, borderLeftColor: '#8B5CF6' }}>
              <FiShoppingBag size={24} style={{ color: '#8B5CF6' }} />
              <div style={styles.statInfo}><span style={styles.statValue}>{stats?.totalOrders || 0}</span><span style={styles.statLabel}>Total Orders</span></div>
            </div>
            <div style={{ ...styles.statCard, borderLeftColor: 'var(--color-success)' }}>
              <FiDollarSign size={24} style={{ color: 'var(--color-success)' }} />
              <div style={styles.statInfo}><span style={styles.statValue}>{formatINR(stats?.totalRevenue || 0)}</span><span style={styles.statLabel}>Total Revenue</span></div>
            </div>
            <div style={{ ...styles.statCard, borderLeftColor: '#F59E0B' }}>
              <FiStar size={24} style={{ color: '#F59E0B' }} />
              <div style={styles.statInfo}><span style={styles.statValue}>{(stats?.averageRating || 0).toFixed(1)}</span><span style={styles.statLabel}>Avg Rating</span></div>
            </div>
          </div>

          <div style={styles.chartsRow}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Revenue (Last 6 Months)</h3>
              <RevenueChart data={revenueData} />
            </div>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Orders by Status</h3>
              <OrdersDonutChart data={orderStatusData} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Your Products ({products.length})</h3>
            <button onClick={() => { resetForm(); setShowDrawer(true); }} className="btn-primary" style={styles.addBtn}>
              <FiPlus size={16} /> Add New Product
            </button>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>{['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td style={styles.td}><img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'} alt="" style={styles.prodImg} /></td>
                    <td style={styles.td}><span style={{ fontWeight: 600 }}>{p.name}</span></td>
                    <td style={{ ...styles.td, textTransform: 'capitalize' }}>{p.category}</td>
                    <td style={styles.td}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{formatINR(p.finalPrice)}</span></td>
                    <td style={styles.td}><span style={{ ...styles.badge, color: p.stock > 0 ? '#10B981' : '#EF4444', backgroundColor: p.stock > 0 ? '#D1FAE5' : '#FEE2E2' }}>{p.stock}</span></td>
                    <td style={styles.td}>{p.isActive ? <span style={{ color: '#10B981' }}>Active</span> : <span style={{ color: '#EF4444' }}>Inactive</span>}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button onClick={() => openEditDrawer(p)} style={styles.iconBtn} title="Edit"><FiEdit2 size={15} /></button>
                        <button onClick={() => handleToggleActive(p)} style={styles.iconBtn} title={p.isActive ? 'Deactivate' : 'Activate'}><FiToggleLeft size={15} /></button>
                        <button onClick={() => handleDeleteProduct(p._id)} style={{ ...styles.iconBtn, color: 'var(--color-error)' }} title="Delete"><FiTrash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>No products yet. Click "Add New Product" to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={prodPage} totalPages={prodTotalPages} onPageChange={setProdPage} />
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div style={styles.filterRow}>
            <h3 style={styles.sectionTitle}>Incoming Orders ({orders.length})</h3>
            <div style={styles.filterTabs}>
              {statusFilters.map((sf) => (
                <button key={sf} onClick={() => { setOrderStatusFilter(sf); setOrdPage(1); }} style={{ ...styles.filterTab, ...(orderStatusFilter === sf ? styles.filterTabActive : {}) }}>
                  {sf.charAt(0).toUpperCase() + sf.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr>{['Order ID', 'Date', 'Customer', 'Items', 'Total', 'Status', 'Update'].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
              <tbody>
                {orders.map((o) => {
                  const allowedNext = STATUS_TRANSITIONS[o.status] || [];
                  return (
                    <tr key={o._id}>
                      <td style={styles.td}><span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 'var(--text-xs)' }}>#{o._id.slice(-8).toUpperCase()}</span></td>
                      <td style={styles.td}>{formatDate(o.createdAt)}</td>
                      <td style={styles.td}>{o.user?.name || 'N/A'}</td>
                      <td style={styles.td}>{o.items?.length || 0}</td>
                      <td style={styles.td}>{formatINR(o.total)}</td>
                      <td style={styles.td}><OrderStatusBadge status={o.status} /></td>
                      <td style={styles.td}>
                        {allowedNext.length > 0 ? (
                          <select
                            value=""
                            onChange={(e) => { if (e.target.value) safeStatusUpdate(o._id, o.status, e.target.value); }}
                            style={styles.statusSelect}
                            disabled={updatingStatus && updatingStatus.startsWith(o._id)}
                          >
                            <option value="" disabled>{updatingStatus?.startsWith(o._id) ? 'Updating...' : 'Update →'}</option>
                            {allowedNext.map((ns) => (
                              <option key={ns} value={ns}>{ns.charAt(0).toUpperCase() + ns.slice(1)}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
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

      {showDrawer && (
        <div style={styles.overlay} onClick={() => setShowDrawer(false)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <h3 style={styles.drawerTitle}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => { setShowDrawer(false); resetForm(); }} style={styles.drawerClose}>✕</button>
            </div>
            <form onSubmit={handleProductSubmit} style={styles.drawerForm}>
              <div style={styles.field}>
                <label style={styles.label}>Product Name</label>
                <input value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} required style={styles.input} />
              </div>
              <div style={styles.fieldRow}>
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>Category</label>
                  <select value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} required style={styles.input}>
                    {['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'groceries', 'automotive', 'other'].map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>Brand</label>
                  <input value={productForm.brand} onChange={(e) => setProductForm((p) => ({ ...p, brand: e.target.value }))} style={styles.input} />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} required style={{ ...styles.input, minHeight: 80, resize: 'vertical' }} />
              </div>
              <div style={styles.fieldRow}>
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>Price (₹)</label>
                  <input type="number" step="0.01" min="0" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} required style={styles.input} />
                </div>
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>Discount %</label>
                  <input type="number" min="0" max="100" value={productForm.discountPercent} onChange={(e) => setProductForm((p) => ({ ...p, discountPercent: e.target.value }))} style={styles.input} />
                </div>
              </div>
              <div style={styles.fieldRow}>
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>Stock</label>
                  <input type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))} required style={styles.input} />
                </div>
                <div style={styles.fieldHalf}>
                  <label style={styles.checkLabel}>
                    <input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm((p) => ({ ...p, isFeatured: e.target.checked }))} style={styles.checkbox} />
                    Featured Product
                  </label>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Product Images (URLs — up to 5)</label>
                {productForm.images.map((url, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', width: 20 }}>{idx + 1}.</span>
                    <input value={url} onChange={(e) => handleImageChange(idx, e.target.value)} style={styles.input} placeholder={`Image URL ${idx + 1}`} />
                    {url && <img src={url} alt="" style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                  </div>
                ))}
              </div>
              <div style={styles.drawerActions}>
                <button type="button" onClick={() => { setShowDrawer(false); resetForm(); }} className="btn-ghost" style={{ padding: 'var(--space-2) var(--space-6)' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingProduct} style={{ padding: 'var(--space-2) var(--space-6)' }}>
                  {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
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
  chartCard: { backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-card)' },
  chartTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 },
  addBtn: { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' },
  filterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' },
  filterTabs: { display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' },
  filterTab: { padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-secondary)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', cursor: 'pointer' },
  filterTabActive: { color: 'var(--color-primary)', borderColor: 'var(--color-primary)', backgroundColor: 'rgba(255,107,53,0.06)' },
  tableWrap: { overflowX: 'auto', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' },
  th: { textAlign: 'left', padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '2px solid var(--color-border)', backgroundColor: 'var(--color-border-light)', textTransform: 'uppercase', fontSize: 'var(--text-xs)', letterSpacing: '0.05em', whiteSpace: 'nowrap' },
  td: { padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-primary)' },
  prodImg: { width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover' },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600 },
  iconBtn: { padding: 'var(--space-1)', cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center' },
  statusSelect: { padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' },
  drawer: { width: '100%', maxWidth: 560, backgroundColor: 'var(--color-bg-card)', height: '100vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-border)' },
  drawerTitle: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 },
  drawerClose: { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' },
  drawerForm: { padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flex: 1, overflowY: 'auto' },
  field: {},
  fieldRow: { display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' },
  fieldHalf: { flex: '1 1 180px' },
  label: { display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' },
  checkLabel: { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginTop: 'var(--space-5)', cursor: 'pointer' },
  checkbox: { width: 16, height: 16, accentColor: 'var(--color-primary)' },
  input: { width: '100%', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color var(--transition-fast)', boxSizing: 'border-box' },
  drawerActions: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', marginTop: 'auto' },
};

export default SellerDashboardPage;
