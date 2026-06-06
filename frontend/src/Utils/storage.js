export function getJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const STORAGE_KEYS = {
  CART: 'eazeit_cart',
  ORDERS: 'eazeit_orders',
  ADDRESSES: 'eazeit_addresses',
  CONTACT_MESSAGES: 'eazeit_contact_messages',
  USERS: 'eazeit_users',
  ADMIN_PRODUCTS: 'eazeit_admin_products',
};

export const SESSION_KEYS = {
  ACTIVE_USER: 'eazeit_active_user',
};



export const FREE_DELIVERY_MIN = 299;
export const DELIVERY_FEE = 40;

export function calcDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
}
