import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Hooks';
import { showToast } from '../Components/Toast';
import { resolveProductImage } from '../Utils/image';
import { FREE_DELIVERY_MIN } from '../Utils/storage';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    updateQty,
    removeFromCart,
  } = useCart();

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  const amountForFreeDelivery = useMemo(
    () => (deliveryFee > 0 ? Math.max(0, FREE_DELIVERY_MIN - cartSubtotal) : 0),
    [deliveryFee, cartSubtotal]
  );

  const proceedToCheckout = () => {
    if (!user) {
      showToast('Please login to continue checkout.', true);
      navigate('/login?redirect=/checkout');
      return;
    }
    if (user.role === 'admin') {
      showToast('Admin account cannot place orders.', true);
      navigate('/admin');
      return;
    }
    navigate('/checkout');
  };

  return (
    <>
      <div className="bg-slate-800 border-b border-slate-700 py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-white mb-2">
              Shopping <span className="text-teal-400">Cart</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base">Review your items and proceed to checkout.</p>
          </div>
          <div className="flex gap-2 items-center text-xs text-slate-400">
            <Link to="/" className="text-teal-400 hover:underline">Home</Link>
            <span>/</span>
            <span className="text-slate-300">Cart</span>
          </div>
        </div>
      </div>

      <section className="py-12 md:py-16 px-4 md:px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          {cartItems.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 md:p-14 text-center">
              <div className="flex justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14 text-slate-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Add some groceries to get started â€” fresh essentials delivered to your door.</p>
              <Link
                to="/products"
                className="inline-block bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-3 rounded-lg transition-all duration-200 active:scale-95"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
              <div className="flex flex-col gap-4">
                {deliveryFee > 0 && amountForFreeDelivery > 0 && (
                  <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl px-4 py-3 text-sm text-teal-400">
                    Add <strong className="text-white">Rs. {amountForFreeDelivery}</strong> more for free delivery on orders above Rs. {FREE_DELIVERY_MIN}.
                  </div>
                )}

                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center transition-all duration-200 hover:border-teal-400/30 hover:shadow-md hover:shadow-teal-400/5"
                  >
                    <div className="w-full md:w-28 h-24 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                      {item.image ? (
                        <img src={resolveProductImage(item.image)} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-slate-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                      <div className="text-xs text-slate-400 mt-1">{item.unit}</div>
                      <div className="text-sm text-teal-400 font-bold mt-2">Rs. {item.price}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="w-8 h-8 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:bg-teal-400/10 hover:border-teal-400/50 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-600"
                        aria-label="Decrease quantity"
                      >
                        âˆ’
                      </button>
                      <span className="w-8 text-center font-semibold text-white">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="w-8 h-8 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:bg-teal-400/10 hover:border-teal-400/50 transition-all duration-200 active:scale-95"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right md:min-w-[90px]">
                      <div className="text-sm text-white font-bold">Rs. {item.price * item.qty}</div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="mt-2 text-xs text-rose-400 hover:text-rose-300 hover:underline transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="bg-slate-800 border border-slate-700 rounded-xl p-5 h-fit lg:sticky lg:top-24">
                <h3 className="text-white font-bold text-lg mb-1">Order Summary</h3>
                <p className="text-xs text-slate-400 mb-4">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>Rs. {cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Delivery</span>
                    <span className={deliveryFee === 0 ? 'text-teal-400 font-semibold' : ''}>
                      {deliveryFee === 0 ? 'Free' : `Rs. ${deliveryFee}`}
                    </span>
                  </div>
                  <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                    <span className="font-bold text-white">Total</span>
                    <span className="text-lg font-extrabold text-teal-400">Rs. {cartTotal}</span>
                  </div>
                </div>
                <button
                  onClick={proceedToCheckout}
                  className="w-full mt-5 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-4 py-3 rounded-lg transition-all duration-200 active:scale-95"
                >
                  Proceed to Checkout
                </button>
                <Link to="/products" className="block text-center mt-3 text-sm text-teal-400 hover:underline">
                  Continue Shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Cart;
