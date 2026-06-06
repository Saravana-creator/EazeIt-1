import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../Context/ProductContext';
import { useAuth } from '../Hooks';
import { showToast } from '../Components/Toast';
import { resolveProductImage } from '../Utils/image';
import {
  apiGetAllOrders,
  apiGetOrderStats,
  apiGetAllUsers,
  apiGetUserStats,
  apiUpdateOrderStatus,
} from '../Utils/api';

// ── Constants ──────────────────────────────────────────────────────────────
const CAT_EMOJI = {
  'Oral Care': '🦷', 'Household': '🧹', 'Bath & Body': '🧼',
  'Food & Snacks': '🍎', 'Personal Care': '💊', 'Beverages': '☕',
  'Dairy': '🥛', 'Others': '📦',
};
const CATEGORIES = ['Oral Care', 'Household', 'Bath & Body', 'Food & Snacks', 'Personal Care', 'Beverages', 'Dairy', 'Others'];
const EMPTY_FORM = { name: '', category: '', brand: '', price: '', mrp: '', unit: '', badge: '', image: '' };
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  Pending:    'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  Confirmed:  'bg-teal-400/10 text-teal-400 border-teal-400/20',
  Processing: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  Shipped:    'bg-purple-400/10 text-purple-400 border-purple-400/20',
  Delivered:  'bg-green-400/10 text-green-400 border-green-400/20',
  Cancelled:  'bg-rose-400/10 text-rose-400 border-rose-400/20',
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
  reader.readAsDataURL(file);
});

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = 'text-white' }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm">
    <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{label}</div>
    <div className={`text-3xl font-serif font-extrabold ${color}`}>{value}</div>
    {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
  </div>
);

// ── Admin Page ────────────────────────────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct, resetToSeed } = useProducts();
  const { user, isAdmin, logout } = useAuth();

  // ── Section & Mobile state ───────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── Dashboard stats ──────────────────────────────────────────────────────
  const [orderStats, setOrderStats] = useState(null);
  const [userStats, setUserStats]   = useState(null);

  // ── Product form ─────────────────────────────────────────────────────────
  const [addForm, setAddForm]     = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState(EMPTY_FORM);

  // ── Orders state ─────────────────────────────────────────────────────────
  const [orders, setOrders]           = useState([]);
  const [orderTotal, setOrderTotal]   = useState(0);
  const [orderPage, setOrderPage]     = useState(1);
  const [orderPages, setOrderPages]   = useState(1);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // ── Users state ──────────────────────────────────────────────────────────
  const [users, setUsers]         = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage]   = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ── Auth Guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user)    { navigate('/login'); return; }
    if (!isAdmin) { navigate('/');     return; }
  }, [user, isAdmin, navigate]);

  // ── Load dashboard stats ─────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const [oStats, uStats] = await Promise.all([
        apiGetOrderStats(),
        apiGetUserStats(),
      ]);
      setOrderStats(oStats);
      setUserStats(uStats);
    } catch (err) {
      console.warn('Could not load stats from backend:', err.message);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'dashboard') loadStats();
  }, [activeSection, loadStats]);

  // ── Load orders ──────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await apiGetAllOrders({ page: orderPage, status: orderStatus, search: orderSearch });
      setOrders(data.orders || []);
      setOrderTotal(data.total || 0);
      setOrderPages(data.pages || 1);
    } catch (err) {
      showToast('Could not load orders: ' + err.message, true);
    } finally {
      setLoadingOrders(false);
    }
  }, [orderPage, orderStatus, orderSearch]);

  useEffect(() => {
    if (activeSection === 'orders') loadOrders();
  }, [activeSection, loadOrders]);

  // ── Load users ───────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await apiGetAllUsers({ page: userPage, search: userSearch });
      setUsers(data.users || []);
      setUserTotal(data.total || 0);
      setUserPages(data.pages || 1);
    } catch (err) {
      showToast('Could not load users: ' + err.message, true);
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage, userSearch]);

  useEffect(() => {
    if (activeSection === 'users') loadUsers();
  }, [activeSection, loadUsers]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate('/login'); };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.category || !addForm.price) {
      showToast('Please fill in required fields (Name, Category, Price)', true);
      return;
    }
    const payload = {
      ...addForm,
      image: resolveProductImage(addForm.image),
    };

    try {
      await addProduct(payload);
      showToast(`"${addForm.name}" added successfully!`);
      setAddForm(EMPTY_FORM);
      setActiveSection('dashboard');
    } catch (err) {
      showToast('Error adding product: ' + err.message, true);
    }
  };

  const handleAddImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', true);
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAddForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      showToast('Unable to load image file.', true);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      showToast('Product deleted.');
    } catch (err) {
      showToast('Error deleting product.', true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(editingId, {
        ...editForm,
        image: resolveProductImage(editForm.image),
      });
      showToast('Product updated successfully!');
      setEditingId(null);
    } catch (err) {
      showToast('Error updating product.', true);
    }
  };

  const handleEditImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', true);
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      showToast('Unable to load image file.', true);
    }
  };

  const openEdit = (product) => {
    setEditForm({ ...product, price: String(product.price), mrp: String(product.mrp || '') });
    setEditingId(product.id || product._id);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order ${orderId} → ${newStatus}`);
    } catch (err) {
      showToast('Error updating status: ' + err.message, true);
    }
  };

  const formatCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return iso || '—'; }
  };

  const recentProducts = [...products].reverse().slice(0, 5);

  const NAV_ITEMS = [
    { key: 'dashboard',       icon: '📊', label: 'Dashboard' },
    { key: 'add-product',     icon: '➕', label: 'Add Product' },
    { key: 'manage-products', icon: '📦', label: 'Manage Products' },
    { key: 'orders',          icon: '🛒', label: 'All Orders' },
    { key: 'users',           icon: '👥', label: 'Users' },
  ];

  const SECTION_TITLES = {
    'dashboard':       'Dashboard Overview',
    'add-product':     'Add New Product',
    'manage-products': 'Manage Products',
    'orders':          'All Orders',
    'users':           'Registered Users',
  };

  // ── Input class helper ───────────────────────────────────────────────────
  const inputCls = 'w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400 transition-colors';

  return (
    <div className="bg-slate-900 text-white font-sans antialiased h-screen overflow-hidden flex flex-col md:flex-row relative z-[9999] top-0 left-0 right-0 bottom-0 w-full fixed">

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 shrink-0 z-20">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-md flex items-center justify-center font-serif font-extrabold text-lg text-slate-900">E</div>
          <span className="font-serif font-extrabold text-sm tracking-widest text-teal-400">ADMIN</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 flex flex-col gap-1">
          <span className="w-5 h-0.5 bg-white rounded" />
          <span className="w-5 h-0.5 bg-white rounded" />
          <span className="w-5 h-0.5 bg-white rounded" />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 border-r border-slate-700 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col h-full`}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center font-serif font-extrabold text-xl text-slate-900">E</div>
            <div className="flex flex-col leading-none">
              <span className="font-serif font-extrabold text-base tracking-widest text-teal-400">EAZEIT</span>
              <span className="text-[8px] text-slate-400 tracking-[0.2em] uppercase mt-0.5">Admin Panel</span>
            </div>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Menu</div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => { setActiveSection(key); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors w-full text-left ${
                  activeSection === key
                    ? 'bg-teal-400/10 text-teal-400 border border-teal-400/20'
                    : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </nav>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4">Links</div>
          <nav className="flex flex-col gap-1">
            <Link to="/" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-700/60 hover:text-white rounded-lg font-medium text-sm transition-colors">
              <span>🏠</span> View Store
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 rounded-lg font-medium text-sm transition-colors w-full text-left">
              <span>🚪</span> Logout
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-400/20 border border-teal-400/40 flex items-center justify-center text-xs font-bold text-teal-400">AD</div>
          <div className="flex flex-col leading-none overflow-hidden">
            <span className="text-xs font-semibold text-white">Admin</span>
            <span className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@eazeit.in'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden relative z-10">
        <header className="h-16 md:h-18 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between shrink-0">
          <h1 className="font-serif font-bold text-lg md:text-xl text-white">{SECTION_TITLES[activeSection]}</h1>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">{user?.email}</span>
            <button onClick={handleLogout} className="text-xs bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 px-3 py-1.5 rounded-lg font-semibold transition-all duration-200">
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">

            {/* ── DASHBOARD ── */}
            {activeSection === 'dashboard' && (
              <div className="flex flex-col gap-8">

                {/* Stats Row 1: Orders */}
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Statistics</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Orders" value={orderStats?.total ?? '—'} color="text-teal-400" />
                    <StatCard label="Today's Orders" value={orderStats?.todayCount ?? '—'} sub="new today" />
                    <StatCard label="Delivered" value={orderStats?.delivered ?? '—'} color="text-green-400" />
                    <StatCard label="Pending" value={orderStats?.pending ?? '—'} color="text-yellow-400" />
                  </div>
                </div>

                {/* Stats Row 2: Revenue & Users */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 bg-gradient-to-r from-teal-400/10 to-teal-500/5 border border-teal-400/20 rounded-xl p-5">
                    <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Total Revenue</div>
                    <div className="text-3xl font-serif font-extrabold text-white">{formatCurrency(orderStats?.revenue)}</div>
                    <div className="text-xs text-slate-400 mt-1">From confirmed + processing + shipped + delivered orders</div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-2">
                    <StatCard label="Registered Users" value={userStats?.total ?? '—'} sub={`+${userStats?.newToday ?? 0} today`} />
                  </div>
                </div>

                {/* Products stat + Quick action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Products</div>
                    <div className="text-3xl font-serif font-extrabold text-white">{products.length}</div>
                    <div className="text-xs text-teal-400 font-bold mt-1">Live in Store</div>
                  </div>
                  <div className="bg-gradient-to-r from-teal-400/10 to-slate-800 border border-teal-400/20 rounded-xl p-5 flex flex-col justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Quick Action</div>
                      <h3 className="text-white font-bold text-base">Add a New Product</h3>
                      <p className="text-xs text-slate-400 mt-1">Products appear live on the store immediately.</p>
                    </div>
                    <button onClick={() => setActiveSection('add-product')} className="w-fit bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold px-5 py-2 rounded-lg text-sm transition-all duration-200 active:scale-95">
                      + Add Product
                    </button>
                  </div>
                </div>

                {/* Recent products */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="font-bold text-base text-white">Recently Added Products</h2>
                    <button onClick={() => setActiveSection('manage-products')} className="text-teal-400 hover:underline text-xs font-semibold">Manage All</button>
                  </div>
                  {recentProducts.length === 0 ? (
                    <div className="p-8 text-sm text-slate-400 text-center">
                      No products yet. <button onClick={() => setActiveSection('add-product')} className="text-teal-400 underline">Add first product</button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
                          <tr>
                            <th className="px-5 py-3">Product</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Price</th>
                            <th className="px-5 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/60">
                          {recentProducts.map((p) => (
                            <tr key={p.id || p._id} className="hover:bg-slate-700/30 transition-colors">
                              <td className="px-5 py-3 font-medium text-white">{p.name}</td>
                              <td className="px-5 py-3 text-slate-400">{p.category}</td>
                              <td className="px-5 py-3 text-teal-400 font-bold">₹{p.price}</td>
                              <td className="px-5 py-3 text-right">
                                <button onClick={() => setActiveSection('manage-products')} className="text-teal-400 hover:text-teal-300 text-xs font-semibold">Manage</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── ADD PRODUCT ── */}
            {activeSection === 'add-product' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h2 className="font-bold text-lg text-white">Add New Product</h2>
                  <p className="text-slate-400 text-sm mt-1">Fill in the details. The product goes live immediately.</p>
                </div>
                <form onSubmit={handleAddSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Product Name *</label>
                    <input type="text" required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Category *</label>
                    <select required value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} className={inputCls}>
                      <option value="">— Select Category —</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Brand</label>
                    <input type="text" value={addForm.brand} onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Price (₹) *</label>
                    <input type="number" min="0" step="0.01" required value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">MRP / Original Price (₹)</label>
                    <input type="number" min="0" step="0.01" value={addForm.mrp} onChange={(e) => setAddForm({ ...addForm, mrp: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Unit / Size</label>
                    <input type="text" placeholder="e.g. 200g, 1L" value={addForm.unit} onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Badge Label</label>
                    <input type="text" placeholder="e.g. BESTSELLER, NEW" value={addForm.badge} onChange={(e) => setAddForm({ ...addForm, badge: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Product Image URL <span className="text-slate-500 font-normal normal-case">(optional)</span></label>
                    <input
                      type="text"
                      value={addForm.image}
                      onChange={(e) => setAddForm({ ...addForm, image: e.target.value })}
                      onBlur={(e) => setAddForm((prev) => ({ ...prev, image: resolveProductImage(e.target.value) }))}
                      className={inputCls}
                      placeholder="Paste any image URL or Google Drive share link"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAddImageFile}
                      className="mt-2 text-sm text-slate-300 file:bg-slate-700 file:border-0 file:px-3 file:py-2 file:rounded-lg file:text-sm file:text-teal-400"
                    />
                    <p className="text-xs text-slate-500">Upload JPEG/PNG/WebP or paste a Google Drive image link. Uploaded files are shown immediately.</p>
                    {addForm.image && (
                      <img src={resolveProductImage(addForm.image)} alt="preview" className="mt-2 h-24 w-24 object-cover rounded-lg border border-slate-600" onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                  </div>
                  <div className="md:col-span-2 flex gap-3 pt-2">
                    <button type="submit" className="bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold px-8 py-3 rounded-lg text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-teal-400/20">
                      ✓ Add Product
                    </button>
                    <button type="button" onClick={() => setAddForm(EMPTY_FORM)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold px-6 py-3 rounded-lg text-sm transition-all duration-200">
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── MANAGE PRODUCTS ── */}
            {activeSection === 'manage-products' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-base text-white">Manage Products</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} in store</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { if (window.confirm('Reset all products to defaults?')) resetToSeed(); }} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs px-3 py-2 rounded-lg transition-all">
                      ↺ Reset
                    </button>
                    <button onClick={() => setActiveSection('add-product')} className="bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-xs px-4 py-2 rounded-lg transition-all">
                      + Add New
                    </button>
                  </div>
                </div>
                {products.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-sm">
                    No products yet. <button onClick={() => setActiveSection('add-product')} className="text-teal-400 underline">Add first product</button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700/60">
                    {products.slice().reverse().map((p) => {
                      const pid = p.id || p._id;
                      return (
                        <div key={pid} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-slate-700/20 transition-colors">
                          <div className="w-14 h-14 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden shrink-0 text-2xl">
                            {p.image
                              ? <img src={resolveProductImage(p.image)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                              : <span>{CAT_EMOJI[p.category] || '📦'}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm">{p.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {p.category}{p.brand ? ` · ${p.brand}` : ''}{p.unit ? ` · ${p.unit}` : ''}
                            </div>
                            {p.badge && <span className="inline-block mt-1 text-[10px] bg-teal-400/10 text-teal-400 border border-teal-400/20 px-2 py-0.5 rounded font-bold uppercase tracking-wide">{p.badge}</span>}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-teal-400 font-bold text-base">₹{p.price}</div>
                            {p.mrp ? <div className="text-slate-500 text-xs line-through">₹{p.mrp}</div> : null}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => openEdit(p)} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-3 py-1.5 rounded-lg transition-all">Edit</button>
                            <button onClick={() => handleDelete(pid, p.name)} className="text-xs bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 font-semibold px-3 py-1.5 rounded-lg transition-all">Delete</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── ALL ORDERS ── */}
            {activeSection === 'orders' && (
              <div className="flex flex-col gap-4">
                {/* Filter bar */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search by order ID or email…"
                    value={orderSearch}
                    onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                  <select
                    value={orderStatus}
                    onChange={(e) => { setOrderStatus(e.target.value); setOrderPage(1); }}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="">All Statuses</option>
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={loadOrders} className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm rounded-lg transition-all">
                    🔍 Search
                  </button>
                </div>

                {/* Summary */}
                <div className="text-xs text-slate-400 px-1">
                  Showing {orders.length} of {orderTotal} order{orderTotal !== 1 ? 's' : ''}
                  {orderStatus ? ` (${orderStatus})` : ''}
                </div>

                {/* Orders table */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  {loadingOrders ? (
                    <div className="p-10 text-center text-slate-400">Loading orders…</div>
                  ) : orders.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">No orders found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase border-b border-slate-700 bg-slate-800/80">
                          <tr>
                            <th className="px-4 py-3">Order ID</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Items</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/60">
                          {orders.map((order) => (
                            <tr key={order._id || order.orderId} className="hover:bg-slate-700/20 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs text-teal-400 font-bold">{order.orderId}</td>
                              <td className="px-4 py-3 text-slate-300 text-xs max-w-[140px] truncate">{order.userEmail}</td>
                              <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(order.placedAt)}</td>
                              <td className="px-4 py-3 text-slate-400 text-xs">{order.items?.length ?? 0} items</td>
                              <td className="px-4 py-3 text-white font-bold text-xs whitespace-nowrap">₹{order.total}</td>
                              <td className="px-4 py-3 text-slate-400 text-xs">{order.paymentMethod}</td>
                              <td className="px-4 py-3">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                  className={`text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer bg-transparent focus:outline-none transition-colors ${STATUS_COLORS[order.status] || 'text-slate-400 border-slate-600'}`}
                                >
                                  {ORDER_STATUSES.map((s) => <option key={s} value={s} className="bg-slate-800 text-white">{s}</option>)}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {orderPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button disabled={orderPage <= 1} onClick={() => setOrderPage((p) => p - 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all">← Prev</button>
                    <span className="px-4 py-2 text-slate-400 text-xs">Page {orderPage} of {orderPages}</span>
                    <button disabled={orderPage >= orderPages} onClick={() => setOrderPage((p) => p + 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all">Next →</button>
                  </div>
                )}
              </div>
            )}

            {/* ── USERS ── */}
            {activeSection === 'users' && (
              <div className="flex flex-col gap-4">
                {/* Search bar */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-3">
                  <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={userSearch}
                    onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                  <button onClick={loadUsers} className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm rounded-lg transition-all">
                    🔍 Search
                  </button>
                </div>

                <div className="text-xs text-slate-400 px-1">
                  Showing {users.length} of {userTotal} registered user{userTotal !== 1 ? 's' : ''}
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  {loadingUsers ? (
                    <div className="p-10 text-center text-slate-400">Loading users…</div>
                  ) : users.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">No users found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase border-b border-slate-700 bg-slate-800/80">
                          <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/60">
                          {users.map((u) => (
                            <tr key={u._id} className="hover:bg-slate-700/20 transition-colors">
                              <td className="px-4 py-3 font-semibold text-white">
                                {u.firstname} {u.lastname}
                              </td>
                              <td className="px-4 py-3 text-slate-300 text-xs">{u.email}</td>
                              <td className="px-4 py-3 text-slate-400 text-xs">{u.phone || '—'}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                                  u.role === 'admin'
                                    ? 'bg-purple-400/10 text-purple-400 border-purple-400/20'
                                    : 'bg-teal-400/10 text-teal-400 border-teal-400/20'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(u.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {userPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button disabled={userPage <= 1} onClick={() => setUserPage((p) => p - 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all">← Prev</button>
                    <span className="px-4 py-2 text-slate-400 text-xs">Page {userPage} of {userPages}</span>
                    <button disabled={userPage >= userPages} onClick={() => setUserPage((p) => p + 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all">Next →</button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-20 md:hidden" />
      )}

      {/* Edit Product Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
              <h3 className="font-bold text-white">Edit Product</h3>
              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Product Name *</label>
                <input type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Category *</label>
                <select required value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Brand</label>
                <input type="text" value={editForm.brand} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Price (₹) *</label>
                <input type="number" min="0" step="0.01" required value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">MRP (₹)</label>
                <input type="number" min="0" step="0.01" value={editForm.mrp} onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Unit / Size</label>
                <input type="text" value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Badge</label>
                <input type="text" value={editForm.badge} onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Image URL</label>
                <input
                  type="text"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  onBlur={(e) => setEditForm((prev) => ({ ...prev, image: resolveProductImage(e.target.value) }))}
                  className={inputCls}
                  placeholder="Paste any image URL or Google Drive share link"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageFile}
                  className="mt-2 text-sm text-slate-300 file:bg-slate-700 file:border-0 file:px-3 file:py-2 file:rounded-lg file:text-sm file:text-teal-400"
                />
                <p className="text-xs text-slate-500">Upload JPEG/PNG/WebP or paste a Google Drive image link. Uploaded files show instantly.</p>
                {editForm.image && (
                  <img src={resolveProductImage(editForm.image)} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-slate-600" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-1">
                <button type="submit" className="bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold px-6 py-2.5 rounded-lg text-sm transition-all active:scale-95">Save Changes</button>
                <button type="button" onClick={() => setEditingId(null)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;