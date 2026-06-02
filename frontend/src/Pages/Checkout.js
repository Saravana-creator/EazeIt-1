import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getActiveUser } from '../utils/storage';
import {
  getAddressesForUser,
  addAddress,
  getDefaultAddress,
  seedDefaultAddresses,
} from '../utils/addresses';
import { generateOrderId, saveOrder } from '../utils/orders';
import { showToast } from '../Components/Toast';

const initialAddress = {
  label: 'HOME',
  name: '',
  line1: '',
  line2: '',
  city: '',
  pincode: '',
  phone: '',
  isDefault: false,
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, deliveryFee, cartTotal, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });

  useEffect(() => {
    const activeUser = getActiveUser();
    if (!activeUser) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (activeUser.role === 'admin') {
      navigate('/admin');
      return;
    }
    setUser(activeUser);
    seedDefaultAddresses(activeUser.email);
    const list = getAddressesForUser(activeUser.email);
    setAddresses(list);
    const defaultAddr = getDefaultAddress(activeUser.email);
    if (defaultAddr) setSelectedAddressId(defaultAddr.id);
  }, [navigate]);

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems, navigate]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const onAddAddress = (e) => {
    e.preventDefault();
    if (!user) return;
    if (!newAddress.name.trim() || !newAddress.line1.trim() || !newAddress.city.trim()) {
      showToast('Please fill all required address fields.', true);
      return;
    }
    if (!/^\d{6}$/.test(newAddress.pincode)) {
      showToast('Pincode must be exactly 6 digits.', true);
      return;
    }
    if (!/^[6-9]\d{9}$/.test(newAddress.phone)) {
      showToast('Phone must be 10 digits starting from 6-9.', true);
      return;
    }
    const added = addAddress(user.email, newAddress);
    const updated = getAddressesForUser(user.email);
    setAddresses(updated);
    setSelectedAddressId(added.id);
    setNewAddress(initialAddress);
    showToast('Address saved successfully.');
  };

  const validatePayment = () => {
    if (paymentMethod === 'UPI') return upiId.trim().length > 0;
    if (paymentMethod === 'CARD') {
      return (
        card.name.trim().length > 1 &&
        /^\d{16}$/.test(card.number.replace(/\s/g, '')) &&
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry) &&
        /^\d{3}$/.test(card.cvv)
      );
    }
    return true;
  };

  const placeOrder = () => {
    if (!user || !selectedAddress) {
      showToast('Please select a delivery address.', true);
      return;
    }
    if (!validatePayment()) {
      showToast('Please complete valid payment details.', true);
      return;
    }
    const orderId = generateOrderId();
    const order = {
      id: orderId,
      items: cartItems,
      subtotal: cartSubtotal,
      deliveryFee,
      total: cartTotal,
      paymentMethod,
      address: selectedAddress,
      status: 'Confirmed',
      placedAt: new Date().toISOString(),
    };
    saveOrder(user.email, order);
    clearCart();
    navigate(`/order-success/${orderId}`);
  };

  return (
    <>
      <div className="bg-slate-800 border-b border-slate-700 py-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif font-extrabold text-3xl text-white">Checkout</h1>
          <div className="text-xs text-slate-400 mt-2">Step {step} of 4</div>
        </div>
      </div>
      <section className="py-10 px-4 md:px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 md:p-6">
            <div className="flex gap-2 mb-6 text-xs">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`px-3 py-2 rounded-lg border ${step === s ? 'bg-teal-400 text-slate-900 border-teal-400' : 'border-slate-600 text-slate-300'}`}
                >
                  {s === 1 ? 'Address' : s === 2 ? 'Review' : s === 3 ? 'Payment' : 'Confirm'}
                </button>
              ))}
            </div>

            {step === 1 && (
              <div>
                <h3 className="text-white font-bold mb-4">Select Delivery Address</h3>
                <div className="space-y-3 mb-6">
                  {addresses.map((addr) => (
                    <label key={addr.id} className="block border border-slate-700 rounded-lg p-3 cursor-pointer">
                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mr-2"
                      />
                      <span className="text-sm font-semibold text-white">{addr.name} ({addr.label})</span>
                      <div className="text-xs text-slate-400 mt-1">
                        {addr.line1}, {addr.line2}, {addr.city} - {addr.pincode} | {addr.phone}
                      </div>
                    </label>
                  ))}
                </div>
                <form onSubmit={onAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={newAddress.name} onChange={(e) => setNewAddress((p) => ({ ...p, name: e.target.value }))} placeholder="Full Name*" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm" />
                  <input value={newAddress.label} onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value.toUpperCase() }))} placeholder="Label (HOME/OFFICE)" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm" />
                  <input value={newAddress.line1} onChange={(e) => setNewAddress((p) => ({ ...p, line1: e.target.value }))} placeholder="Address Line 1*" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm md:col-span-2" />
                  <input value={newAddress.line2} onChange={(e) => setNewAddress((p) => ({ ...p, line2: e.target.value }))} placeholder="Address Line 2" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm md:col-span-2" />
                  <input value={newAddress.city} onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))} placeholder="City*" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm" />
                  <input value={newAddress.pincode} onChange={(e) => setNewAddress((p) => ({ ...p, pincode: e.target.value }))} placeholder="Pincode*" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm" />
                  <input value={newAddress.phone} onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone*" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm md:col-span-2" />
                  <button className="bg-teal-400 text-slate-900 font-bold text-sm py-2 rounded-lg md:col-span-2">Save Address</button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-white font-bold mb-4">Review Items</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex justify-between border-b border-slate-700 pb-2 text-sm">
                      <span>{item.name} x {item.qty}</span>
                      <span>Rs. {item.qty * item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-white font-bold mb-4">Select Payment Method</h3>
                <div className="space-y-3 text-sm">
                  {['UPI', 'CARD', 'COD'].map((method) => (
                    <label key={method} className="block border border-slate-700 rounded-lg p-3 cursor-pointer">
                      <input type="radio" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="mr-2" />
                      {method === 'CARD' ? 'Credit / Debit Card' : method === 'COD' ? 'Cash on Delivery' : 'UPI'}
                    </label>
                  ))}
                </div>
                {paymentMethod === 'UPI' && (
                  <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="Enter UPI ID (example@upi)" className="mt-4 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm" />
                )}
                {paymentMethod === 'CARD' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <input value={card.name} onChange={(e) => setCard((p) => ({ ...p, name: e.target.value }))} placeholder="Name on card" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm md:col-span-2" />
                    <input value={card.number} onChange={(e) => setCard((p) => ({ ...p, number: e.target.value }))} placeholder="Card number (16 digits)" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm md:col-span-2" />
                    <input value={card.expiry} onChange={(e) => setCard((p) => ({ ...p, expiry: e.target.value }))} placeholder="MM/YY" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm" />
                    <input value={card.cvv} onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value }))} placeholder="CVV" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm" />
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <h3 className="text-white font-bold mb-4">Confirm Order</h3>
                <p className="text-sm text-slate-300 mb-3">Address: {selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : 'Not selected'}</p>
                <p className="text-sm text-slate-300 mb-6">Payment: {paymentMethod}</p>
                <button onClick={placeOrder} className="bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-3 rounded-lg transition-all duration-200 active:scale-95">
                  Place Order
                </button>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep((s) => Math.max(1, s - 1))} className="text-sm text-slate-300 hover:text-white">Back</button>
              <button onClick={() => setStep((s) => Math.min(4, s + 1))} className="text-sm text-teal-400 hover:underline">Next</button>
            </div>
          </div>

          <aside className="bg-slate-800 border border-slate-700 rounded-xl p-5 h-fit">
            <h3 className="text-white font-bold mb-4">Price Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-300"><span>Subtotal</span><span>Rs. {cartSubtotal}</span></div>
              <div className="flex justify-between text-slate-300"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : `Rs. ${deliveryFee}`}</span></div>
              <div className="flex justify-between text-white border-t border-slate-700 pt-3 font-bold"><span>Total</span><span>Rs. {cartTotal}</span></div>
            </div>
            <Link to="/cart" className="block mt-4 text-sm text-teal-400 hover:underline">Back to Cart</Link>
          </aside>
        </div>
      </section>
    </>
  );
};

export default Checkout;
