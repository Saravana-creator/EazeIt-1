import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getJSON, setJSON, STORAGE_KEYS, calcDeliveryFee } from '../utils/storage';
import { cartItemFromProduct } from '../data/products';

const CartContext = createContext(null);

function loadCart() {
  const data = getJSON(STORAGE_KEYS.CART, { items: [] });
  return Array.isArray(data?.items) ? data.items : [];
}

function persistCart(items) {
  setJSON(STORAGE_KEYS.CART, { items });
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    persistCart(cartItems);
  }, [cartItems]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );

  const deliveryFee = useMemo(() => calcDeliveryFee(cartSubtotal), [cartSubtotal]);
  const cartTotal = cartSubtotal + deliveryFee;

  const addToCart = useCallback((product, qty = 1) => {
    const line = cartItemFromProduct(product, qty);
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === line.productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + line.qty };
        return next;
      }
      return [...prev, line];
    });
  }, []);

  const updateQty = useCallback((productId, qty) => {
    const n = Math.max(0, Number(qty) || 0);
    setCartItems((prev) => {
      if (n === 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, qty: n } : i));
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
