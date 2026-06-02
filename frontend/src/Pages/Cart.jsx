import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getActiveUser } from '../utils/storage';
import { showToast } from '../components/Toast';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    updateQty,
    removeFromCart,
  } = useCart();

  const proceedToCheckout = () => {
    const user = getActiveUser();
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
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
              <div className="text-5xl mb-3">🛒</div>
              <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
              <p className="text-slate-400 text-sm mb-6">Add some groceries to get started.</p>
              <Link to="/products" className="inline-block bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-3 rounded-lg transition-all duration-200 active:scale-95">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
              <div className="flex flex-col gap-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="w-full md:w-28 h-24 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white">{item.name}</h3>
                      <div className="text-xs text-slate-400 mt-1">{item.unit}</div>
                      <div className="text-sm text-teal-400 font-bold mt-2">Rs. {item.price}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-8 h-8 rounded-lg border border-slate-600 text-slate-300 hover:text-white">-</button>
                      <span className="w-8 text-center font-semibold">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-8 h-8 rounded-lg border border-slate-600 text-slate-300 hover:text-white">+</button>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-white font-bold">Rs. {item.price * item.qty}</div>
                      <button onClick={() => removeFromCart(item.productId)} className="mt-2 text-xs text-rose-400 hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="bg-slate-800 border border-slate-700 rounded-xl p-5 h-fit">
                <h3 className="text-white font-bold text-lg mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>Rs. {cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? 'Free' : `Rs. ${deliveryFee}`}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-white">
                    <span>Total</span>
                    <span>Rs. {cartTotal}</span>
                  </div>
                </div>
                <button onClick={proceedToCheckout} className="w-full mt-5 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-4 py-3 rounded-lg transition-all duration-200 active:scale-95">
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
