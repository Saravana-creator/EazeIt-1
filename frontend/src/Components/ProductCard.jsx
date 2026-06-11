import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Hooks';
import { showToast } from './Toast';
import { resolveProductImage } from '../Utils/image';

const CAT_EMOJI = {
  'Oral Care': 'ðŸ¦·',
  'Household': 'ðŸ§¹',
  'Bath & Body': 'ðŸ§¼',
  'Food & Snacks': 'ðŸŽ',
  'Personal Care': 'ðŸ’Š',
  'Beverages': 'â˜•',
  'Dairy': 'ðŸ¥›',
  'Others': 'ðŸ“¦',
};

/**
 * ProductCard â€“ Reusable product card component.
 *
 * Props:
 *  - product  {object}  Product data (id, name, category, brand, price, mrp, unit, badge, image)
 *  - compact  {boolean} Smaller card style (used on Home page)
 *  - index    {number}  Used for staggered entrance animation delay
 *
 * Features:
 *  - +/- qty stepper directly on card (no redirect)
 *  - Buy Now â†’ goes to cart
 *  - Discount % badge when mrp > price
 *  - Staggered fade-in entrance animation
 *  - Lazy image loading for performance
 */
const ProductCard = ({ product, compact = false, index = 0 }) => {
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQty, removeFromCart } = useCart();
  const { user } = useAuth();

  // Resolve the canonical product ID (ProductContext normalizes _id â†’ id, but guard both)
  const pid = product.id || product._id || '';

  // Find how many of this product are already in cart
  const cartItem = cartItems.find((i) => i.productId === pid);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
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
      removeFromCart(pid);
    } else {
      updateQty(pid, qtyInCart - 1);
    }
  }, [pid, qtyInCart, removeFromCart, updateQty]);

  const handleBuyNow = useCallback(() => {
    addToCart({ ...product, id: pid }, 1);
    if (!user) {
      navigate('/login?redirect=/cart');
    } else {
      navigate('/cart');
    }
  }, [product, pid, addToCart, user, navigate]);

  // Staggered delay based on index (capped at 500ms for large grids)
  const animDelay = Math.min(index * 60, 500);

  return (
    <div
      className="product-card-enter bg-slate-800 border border-slate-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-teal-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-400/10 flex flex-col justify-between h-full"
      style={{ animationDelay: `${animDelay}ms` }}
    >

      {/* â”€â”€ Product Image â”€â”€ */}
      <div
        className="relative w-full bg-slate-800 border-b border-slate-700 overflow-hidden flex items-center justify-center"
        style={{ height: compact ? '160px' : '192px' }}
      >
        {/* Skeleton placeholder while image loads */}
        {product.image && !imgError && !imgLoaded && (
          <div className="skeleton absolute inset-0" />
        )}

        {product.image && !imgError ? (
          <img
            src={resolveProductImage(product.image)}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover hover:scale-110 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ transition: 'opacity 0.3s ease, transform 0.5s ease' }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
            <span className="text-4xl">{CAT_EMOJI[product.category] || 'ðŸ“¦'}</span>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3 left-3 bg-teal-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider"
            style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
          >
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

      {/* â”€â”€ Product Details â”€â”€ */}
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

        {/* â”€â”€ Price Row â”€â”€ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-teal-400">Rs. {product.price}</span>
            {discount > 0 && (
              <span className="text-xs text-slate-500 line-through">Rs. {product.mrp}</span>
            )}
          </div>

          {/* â”€â”€ Cart Controls â”€â”€ */}
          {qtyInCart === 0 ? (
            /* Not in cart yet â€” show Add to Cart + Buy Now */
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
                -
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
