import { getJSON, STORAGE_KEYS } from '../Utils/storage';
import { colgate, harpic, godrejSoap } from '../Assets';

// ── Static seed products (always available) ───────────────────────────────────
export const STATIC_PRODUCTS = [
  { id: 's1', name: 'Colgate Strong Teeth Toothpaste', category: 'Oral Care', brand: 'Colgate', price: 45, mrp: 50, unit: '200g + 160g Pack', badge: 'Best Seller', image: colgate },
  { id: 's2', name: 'Colgate Total Advanced Whitening', category: 'Oral Care', brand: 'Colgate', price: 29, mrp: 30, unit: '150g Tube', badge: '', image: colgate },
  { id: 's3', name: 'Colgate Cavity Protection Paste', category: 'Oral Care', brand: 'Colgate', price: 35, mrp: 36, unit: '100g Tube', badge: 'New', image: colgate },
  { id: 's4', name: 'Harpic Power Plus Original', category: 'Household', brand: 'Harpic', price: 89, mrp: 95, unit: '500ml Bottle', badge: 'Popular', image: harpic },
  { id: 's5', name: 'Harpic Sparkling Lemon Cleaner', category: 'Household', brand: 'Harpic', price: 79, mrp: 89, unit: '500ml Bottle', badge: '', image: harpic },
  { id: 's6', name: 'Harpic White & Shine Bleach', category: 'Household', brand: 'Harpic', price: 129, mrp: 165, unit: '1 Litre Bottle', badge: '10X Action', image: harpic },
  { id: 's7', name: 'Godrej No.1 Aloe Vera Soap', category: 'Bath & Body', brand: 'Godrej', price: 99, mrp: 140, unit: 'Pack of 4 x 100g', badge: 'Value Pack', image: godrejSoap },
  { id: 's8', name: 'Godrej No.1 Sandal Soap', category: 'Bath & Body', brand: 'Godrej', price: 79, mrp: 110, unit: 'Pack of 3 x 100g', badge: '', image: godrejSoap },
  { id: 's9', name: 'Tata Salt Iodised', category: 'Food & Snacks', brand: 'Others', price: 24, mrp: 30, unit: '1 kg Pack', badge: 'New', image: '' },
  { id: 's10', name: 'Aashirvaad Whole Wheat Atta', category: 'Food & Snacks', brand: 'Others', price: 249, mrp: 310, unit: '5 kg Bag', badge: '', image: '' },
];

// ── Category constants used across Products page & Home page ─────────────────
export const CATEGORIES = ['All Products', 'Oral Care', 'Household', 'Bath & Body', 'Food & Snacks'];

// ── Emoji map for categories (used in ProductCard & Home) ────────────────────
export const CAT_EMOJI = {
  'Oral Care': '🦷',
  Household: '🧹',
  'Bath & Body': '🧼',
  'Food & Snacks': '🍎',
  'Personal Care': '💊',
  Beverages: '☕',
  Dairy: '🥛',
  Others: '📦',
};

// ── Helpers to read admin-added products from localStorage ────────────────────
export function getAdminProducts() {
  return getJSON(STORAGE_KEYS.ADMIN_PRODUCTS, []) || [];
}

// Returns static + admin products combined
export function getAllProducts() {
  return [...STATIC_PRODUCTS, ...getAdminProducts()];
}

// Find a single product by its id
export function getProductById(id) {
  return getAllProducts().find((p) => p.id === id) || null;
}

// Build a cart line item from a product object
export function cartItemFromProduct(product, qty = 1) {
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand || 'Others',
    price: product.price,
    mrp: product.mrp || product.price,
    image: product.image || '',
    unit: product.unit || '',
    qty: Math.max(1, qty),
  };
}
