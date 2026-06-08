// ── Cart is the only data kept in localStorage (ephemeral, per-device) ────────

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
};

export const FREE_DELIVERY_MIN = 500;
export const DELIVERY_FEE = 10;

export function calcDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
}
