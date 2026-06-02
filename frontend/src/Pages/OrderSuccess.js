import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getActiveUser } from '../utils/storage';
import { getOrderById, formatOrderDate } from '../utils/orders';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const user = getActiveUser();
  const order = user ? getOrderById(user.email, orderId) : null;

  return (
    <section className="py-16 px-4 md:px-6 bg-slate-900 min-h-[70vh]">
      <div className="max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="font-serif font-extrabold text-3xl text-white mb-2">Order Placed Successfully</h1>
        <p className="text-slate-400 text-sm mb-6">Thank you for shopping with EAZEIT.</p>

        {order ? (
          <div className="text-left bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6 text-sm">
            <div className="flex justify-between mb-2"><span className="text-slate-400">Order ID</span><span className="text-white font-semibold">{order.id}</span></div>
            <div className="flex justify-between mb-2"><span className="text-slate-400">Date</span><span className="text-white">{formatOrderDate(order.placedAt)}</span></div>
            <div className="flex justify-between mb-2"><span className="text-slate-400">Payment</span><span className="text-white">{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total</span><span className="text-teal-400 font-bold">Rs. {order.total}</span></div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm mb-6">Order details are not available.</p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/profile?tab=orders-tab" className="bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-5 py-3 rounded-lg transition-all duration-200 active:scale-95">
            View Orders
          </Link>
          <Link to="/products" className="bg-transparent border border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-slate-900 font-bold text-sm px-5 py-3 rounded-lg transition-all duration-200 active:scale-95">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;
