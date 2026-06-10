import { getJSON, setJSON, STORAGE_KEYS } from './storage';

export function generateOrderId() {
  const all = getJSON(STORAGE_KEYS.ORDERS, {}) || {};
  let max = 10000;
  Object.values(all).forEach((orders) => {
    (orders || []).forEach((o) => {
      const num = parseInt(String(o.id).replace(/\D/g, ''), 10);
      if (!Number.isNaN(num) && num > max) max = num;
    });
  });
  return `EZ-${max + 1}`;
}

export function getOrdersForUser(email) {
  if (!email) return [];
  const all = getJSON(STORAGE_KEYS.ORDERS, {}) || {};
  return (all[email.toLowerCase()] || []).slice().sort(
    (a, b) => new Date(b.placedAt) - new Date(a.placedAt)
  );
}

export function getOrderById(email, orderId) {
  return getOrdersForUser(email).find((o) => o.id === orderId) || null;
}

export function saveOrder(email, order) {
  const key = email.toLowerCase();
  const all = getJSON(STORAGE_KEYS.ORDERS, {}) || {};
  const list = all[key] || [];
  list.unshift(order);
  all[key] = list;
  setJSON(STORAGE_KEYS.ORDERS, all);
  return order;
}

export function formatOrderDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
