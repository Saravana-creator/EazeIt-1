import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Hooks';
import { showToast } from './Toast';
import { resolveProductImage } from '../Utils/image';

const CAT_EMOJI = {
  'Oral Care': '🦷',
  'Household': '🧹',
  'Bath & Body': '🧼',
  'Food & Snacks': '🍎',
  'Personal Care': '💊',
  'Beverages': '☕',
  'Dairy': '🥛',
  'Others': '📦',
};

/**
 * ProductCard – Reusable product card component.
 *
 * Props:
 *  - product  {object}  Product data (id, name, category, brand, price, mrp, unit, badge, image)
 *  - compact  {boolean} Smaller card style (used on Home page)
 *
 * Features:
 *  - +/- qty stepper directly on card (no redirect)
 *  - Buy Now → goes to cart
 *  - Discount % badge when mrp > price
 */
const ProductCard = ({ product, compact = false }) => {
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQty, removeFromCart } = useCart();
  const { user } = useAuth();

  // Find how many of this product are already in cart
  const cartItem = cartItems.find((i) => i.productId === product.id);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [product.image]);

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  // Add first item to cart with a brief "adding" animation
  const handleAddFirst = useCallback(() => {
    setAdding(true);
    addToCart(product, 1);
    showToast(`"${product.name}" added to cart!`);
    setTimeout(() => setAdding(false), 300);
  }, [product, addToCart]);

  const handleIncrease = useCallback(() => {
    addToCart(product, 1);
  }, [product, addToCart]);

  const handleDecrease = useCallback(() => {
    if (qtyInCart === 1) {
      removeFromCart(product.id);
    } else {
      updateQty(product.id, qtyInCart - 1);
    }
  }, [product.id, qtyInCart, removeFromCart, updateQty]);

  const handleBuyNow = useCallback(() => {
    addToCart(product, 1);
    if (!user) {
      navigate('/login?redirect=/cart');
    } else {
      navigate('/cart');
    }
  }, [product, addToCart, user, navigate]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-teal-400 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-full">

      {/* ── Product Image ── */}
      <div
        className="relative w-full bg-slate-800 border-b border-slate-700 overflow-hidden flex items-center justify-center"
        style={{ height: compact ? '160px' : '192px' }}
      >
        {product.image && !imgError ? (
          <img
            src={resolveProductImage(product.image)}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
            <span className="text-4xl">{CAT_EMOJI[product.category] || '📦'}</span>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-teal-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
            {product.badge}
          </span>
        )}

        {/* Discount % */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </div>

      {/* ── Product Details ── */}
      <div className={`flex-1 flex flex-col justify-between ${compact ? 'p-4' : 'p-5'}`}>
        <div>
          <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider mb-1.5">
            {product.category}
          </div>
          <h3 className="text-sm font-semibold text-white mb-1 leading-snug line-clamp-2">
            {product.name}
          </h3>
          {product.unit && (
            <div className="text-[11px] text-slate-500 mb-3">{product.unit}</div>
          )}
        </div>

        {/* ── Price Row ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-teal-400">Rs. {product.price}</span>
            {discount > 0 && (
              <span className="text-xs text-slate-500 line-through">Rs. {product.mrp}</span>
            )}
          </div>

          {/* ── Cart Controls ── */}
          {qtyInCart === 0 ? (
            /* Not in cart yet — show Add to Cart + Buy Now */
            <div className="flex gap-2">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-xs py-2 px-3 rounded-lg transition-all duration-200 active:scale-95"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddFirst}
                className={`flex-1 border border-teal-400/50 hover:border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-slate-900 font-bold text-xs py-2 px-3 rounded-lg transition-all duration-200 active:scale-95 ${adding ? 'scale-95 opacity-70' : ''}`}
              >
                + Cart
              </button>
            </div>
          ) : (
            /* Already in cart — show +/- stepper */
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrease}
                className="w-9 h-9 rounded-lg border border-slate-600 hover:border-rose-400 hover:bg-rose-400/10 text-slate-300 hover:text-rose-400 font-bold text-lg transition-all duration-200 active:scale-90 flex items-center justify-center"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="text-white font-bold text-sm">{qtyInCart}</span>
                <div className="text-[9px] text-teal-400 font-semibold">IN CART</div>
              </div>
              <button
                onClick={handleIncrease}
                className="w-9 h-9 rounded-lg border border-slate-600 hover:border-teal-400 hover:bg-teal-400/10 text-slate-300 hover:text-teal-400 font-bold text-lg transition-all duration-200 active:scale-90 flex items-center justify-center"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
