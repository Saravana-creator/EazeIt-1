// ── API Base URL ─────────────────────────────────────────────────────────────
// Reads from .env REACT_APP_API_URL — supports both local and deployed backend
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Session Storage helpers ───────────────────────────────────────────────────

export function getToken() {
  return sessionStorage.getItem('eazeit_auth_token') || '';
}

export function setAuthSession(token, user) {
  if (token) sessionStorage.setItem('eazeit_auth_token', token);
  sessionStorage.setItem('eazeit_active_user', JSON.stringify(user));
}

export function clearAuthSession() {
  sessionStorage.removeItem('eazeit_auth_token');
  sessionStorage.removeItem('eazeit_active_user');
}

// ── Helper: normalize user field casing from backend → frontend ──────────────
function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    firstName: user.firstname || user.firstName || '',
    lastName:  user.lastname  || user.lastName  || '',
    mobile:    user.phone     || user.mobile    || '',
  };
}

// ── Core fetch wrapper with automatic JWT injection ──────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url      = `${API_BASE}${path}`;
  const response = await fetch(url, { ...options, headers, mode: 'cors' });
  const data     = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

// ── Auth Endpoints ────────────────────────────────────────────────────────────

export async function apiSignUp(firstname, lastname, email, phone, password) {
  const data = await request('/users/signup', {
    method: 'POST',
    body:   JSON.stringify({ firstname, lastname, email, phone, password }),
  });
  const normalized = normalizeUser(data.user);
  setAuthSession(data.token, normalized);
  return normalized;
}

export async function apiLogin(email, password) {
  const data = await request('/users/login', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });
  const normalized = normalizeUser(data.user);
  setAuthSession(data.token, normalized);
  return normalized;
}

export async function apiGetProfile(email) {
  const data = await request(`/users/profile/${encodeURIComponent(email)}`);
  return normalizeUser(data.user);
}

export async function apiUpdateProfile(email, profileData) {
  const payload = {
    firstname: profileData.firstName || profileData.firstname || '',
    lastname:  profileData.lastName  || profileData.lastname  || '',
    phone:     profileData.mobile    || profileData.phone     || '',
  };
  const data = await request(`/users/profile/${encodeURIComponent(email)}`, {
    method: 'PUT',
    body:   JSON.stringify(payload),
  });
  const normalized = normalizeUser(data.user);
  sessionStorage.setItem('eazeit_active_user', JSON.stringify(normalized));
  return normalized;
}

export async function apiSendFeedback(feedbackData) {
  const data = await request('/feedback', {
    method: 'POST',
    body:   JSON.stringify(feedbackData),
  });
  return data;
}

// ── Admin: Users ─────────────────────────────────────────────────────────────

export async function apiGetAllUsers({ page = 1, limit = 20, search = '' } = {}) {
  const params = new URLSearchParams({ page, limit, ...(search ? { search } : {}) });
  const data = await request(`/users?${params}`);
  return data; // { users, total, page, pages }
}

export async function apiGetUserStats() {
  const data = await request('/users/stats');
  return data; // { total, newToday }
}

// ── Product Endpoints ─────────────────────────────────────────────────────────

export async function apiGetProducts({ category, brand, search, sort } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'All Products') params.append('category', category);
  if (brand)    params.append('brand', brand);
  if (search)   params.append('search', search);
  if (sort)     params.append('sort', sort);
  const data = await request(`/products?${params}`);
  return data.products;
}

export async function apiAddProduct(productData) {
  const data = await request('/products', {
    method: 'POST',
    body:   JSON.stringify(productData),
  });
  return data.product;
}

export async function apiUpdateProduct(id, productData) {
  const data = await request(`/products/${id}`, {
    method: 'PUT',
    body:   JSON.stringify(productData),
  });
  return data.product;
}

export async function apiDeleteProduct(id) {
  return await request(`/products/${id}`, { method: 'DELETE' });
}

// ── Order Endpoints ───────────────────────────────────────────────────────────

export async function apiPlaceOrder(orderData) {
  const data = await request('/orders', {
    method: 'POST',
    body:   JSON.stringify(orderData),
  });
  return data.order;
}

export async function apiGetUserOrders(email) {
  const data = await request(`/orders/user/${encodeURIComponent(email)}`);
  return data.orders;
}

export async function apiGetOrderById(orderId) {
  const data = await request(`/orders/${orderId}`);
  return data.order;
}

// ── Admin: Orders ─────────────────────────────────────────────────────────────

export async function apiGetAllOrders({ page = 1, limit = 20, status = '', search = '' } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  const data = await request(`/orders?${params}`);
  return data; // { orders, total, page, pages, revenue }
}

export async function apiGetOrderStats() {
  const data = await request('/orders/stats');
  return data; // { total, pending, confirmed, delivered, cancelled, revenue, todayCount }
}

export async function apiUpdateOrderStatus(orderId, status) {
  const data = await request(`/orders/${orderId}/status`, {
    method: 'PUT',
    body:   JSON.stringify({ status }),
  });
  return data.order;
}

// ── Payment Endpoints ─────────────────────────────────────────────────────────

/**
 * Creates a Razorpay order on the backend.
 * @param {number} amount — in rupees (backend converts to paise)
 * @returns {{ orderId, amount, currency, key }}
 */
export async function createRazorpayOrder(amount) {
  return await request('/payment/create-order', {
    method: 'POST',
    body:   JSON.stringify({ amount }),
  });
}

/**
 * Verifies a Razorpay payment signature on the backend.
 * @param {{ razorpay_order_id, razorpay_payment_id, razorpay_signature }} payload
 * @returns {{ verified: true, paymentId }}
 */
export async function verifyRazorpayPayment(payload) {
  return await request('/payment/verify', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
}
