/**
 * src/Data/products.js
 * --------------------
 * Utility functions for product-related operations.
 * The actual product list lives in MongoDB (fetched via ProductContext → API).
 * This file only provides helper functions used by CartContext and elsewhere.
 */

export const CATEGORIES = [
  'All Products',
  'Oral Care',
  'Household',
  'Bath & Body',
  'Food & Snacks',
  'Personal Care',
  'Beverages',
  'Dairy',
  'Others',
];

export const CAT_EMOJI = {
  'Oral Care':    '🦷',
  'Household':    '🧹',
  'Bath & Body':  '🧼',
  'Food & Snacks':'🍎',
  'Personal Care':'💊',
  'Beverages':    '☕',
  'Dairy':        '🥛',
  'Others':       '📦',
};

/**
 * cartItemFromProduct
 * -------------------
 * Converts a full product object into a lean cart line-item.
 * Used by CartContext when addToCart is called.
 *
 * @param {object} product  — the full product object from ProductContext
 * @param {number} qty      — quantity to add (default 1)
 * @returns {object}        — cart line item
 */
export function cartItemFromProduct(product, qty = 1) {
  return {
    productId: product.id || product._id || '',
    name:      product.name,
    category:  product.category,
    brand:     product.brand || 'Others',
    price:     product.price,
    mrp:       product.mrp || product.price,
    image:     product.image || '',
    unit:      product.unit || '',
    qty:       Math.max(1, qty),
  };
}
