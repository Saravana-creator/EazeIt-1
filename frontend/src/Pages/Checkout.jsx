import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Hooks';
import { showToast } from '../Components/Toast';
import { apiPlaceOrder, createRazorpayOrder, verifyRazorpayPayment, apiGetAddresses, apiAddAddress } from '../Utils/api';
import { resolveProductImage } from '../Utils/image';
/** Dynamically loads the Razorpay checkout script */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id  = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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

const STEPS = [
  { id: 1, label: 'Address' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Confirm' },
];

const PAYMENT_METHODS = [
  { id: 'UPI',  label: 'UPI',                desc: 'Pay via any UPI app' },
  { id: 'CARD', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'COD',  label: 'Cash on Delivery',    desc: 'Pay when you receive' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, deliveryFee, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep]                       = useState(1);
  const [addresses, setAddresses]             = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress]           = useState(initialAddress);
  const [paymentMethod, setPaymentMethod]     = useState('UPI');
  const [upiId, setUpiId]                     = useState('');
  const [card, setCard]                       = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [placing, setPlacing]                 = useState(false);
  const [addingAddress, setAddingAddress]     = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login?redirect=/checkout'); return; }
    if (user.role === 'admin') { navigate('/admin'); return; }

    // Load addresses from MongoDB
    const loadAddresses = async () => {
      try {
        const list = await apiGetAddresses(user.email);
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelectedAddressId(def.id);
      } catch (err) {
        showToast('Failed to load saved addresses.', true);
      }
    };
    loadAddresses();
  }, [user, navigate]);

  useEffect(() => {
    if (!isOrderCompleted && cartItems.length === 0) navigate('/cart');
  }, [cartItems, navigate, isOrderCompleted]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  /* â”€â”€ Add address via API â”€â”€ */
  const onAddAddress = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!newAddress.name.trim() || !newAddress.line1.trim() || !newAddress.city.trim()) {
      showToast('Please fill all required address fields.', true); return;
    }
    if (!/^\d{6}$/.test(newAddress.pincode)) {
      showToast('Pincode must be exactly 6 digits.', true); return;
    }
    if (!/^[6-9]\d{9}$/.test(newAddress.phone)) {
      showToast('Phone must be 10 digits starting with 6-9.', true); return;
    }
    try {
      const { addresses: updatedList, added } = await apiAddAddress(user.email, newAddress);
      setAddresses(updatedList);
      setSelectedAddressId(added.id);
      setNewAddress(initialAddress);
      setAddingAddress(false);
      showToast('Address saved successfully! âœ“');
    } catch (err) {
      showToast(err.message || 'Failed to save address.', true);
    }
  };

  /* â”€â”€ Validate payment â”€â”€ */
  const validatePayment = () => {
    if (paymentMethod === 'UPI')  return upiId.trim().length > 0;
    if (paymentMethod === 'CARD') {
      return (
        card.name.trim().length > 1 &&
        /^\d{16}$/.test(card.number.replace(/\s/g, '')) &&
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry) &&
        /^\d{3}$/.test(card.cvv)
      );
    }
    return true; // COD
  };

  /* â”€â”€ Shared: save & navigate after successful payment â”€â”€ */
  const finaliseOrder = async (orderData, paymentId = null) => {
    try {
      const saved = await apiPlaceOrder({ ...orderData, razorpayPaymentId: paymentId });
      const orderId = saved.orderId || saved.id;
      setIsOrderCompleted(true);
      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      const isNet = err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch');
      if (!isNet) {
        showToast(err.message, true);
        setPlacing(false);
        return;
      }
      showToast('Unable to place the order. Please try again when the network is available.', true);
      setPlacing(false);
    }
  };

  /* â”€â”€ Build shared order payload â”€â”€ */
  const buildOrderData = () => ({
    userEmail: user.email,
    items: cartItems.map(item => ({
      productId: item.productId,
      name: item.name,
      category: item.category || 'Others',
      brand: item.brand || 'Others',
      price: item.price,
      mrp: item.mrp || 0,
      image: item.image || '',
      unit: item.unit || '',
      qty: item.qty,
    })),
    address: {
      label: selectedAddress.label,
      name: selectedAddress.name,
      line1: selectedAddress.line1,
      line2: selectedAddress.line2 || '',
      city: selectedAddress.city,
      pincode: selectedAddress.pincode,
      phone: selectedAddress.phone,
    },
    paymentMethod,
    subtotal: cartSubtotal,
    deliveryFee,
    total: cartTotal,
  });

  /* â”€â”€ Place order â”€â”€ */
  const placeOrder = async () => {
    if (!selectedAddress) { showToast('Please select a delivery address.', true); return; }
    if (!validatePayment()) { showToast('Please complete valid payment details.', true); return; }

    setPlacing(true);

    // COD: skip Razorpay, place directly
    if (paymentMethod === 'COD') {
      await finaliseOrder(buildOrderData());
      return;
    }

    // UPI / CARD: open Razorpay popup
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      showToast('Could not load payment gateway. Please try again.', true);
      setPlacing(false);
      return;
    }

    let rzpOrder = null;
    try {
      rzpOrder = await createRazorpayOrder(cartTotal);
    } catch (err) {
      showToast('Payment service unavailable. Please try again later.', true);
      setPlacing(false);
      return;
    }

    const prefill = {
      name:    user.firstName + ' ' + (user.lastName || ''),
      email:   user.email,
      contact: user.mobile || selectedAddress.phone,
      ...(paymentMethod === 'UPI' ? { vpa: upiId } : {}),
    };

    const options = {
      key:         rzpOrder.key,
      amount:      rzpOrder.amount,
      currency:    rzpOrder.currency,
      name:        'EAZEIT',
      description: 'Annachi Kadai â€” Quick Grocery',
      order_id:    rzpOrder.orderId,
      prefill,
      theme: { color: '#2dd4bf' },
      modal: {
        ondismiss: () => {
          showToast('Payment cancelled. Your order was not placed.', true);
          setPlacing(false);
        },
      },
      handler: async (response) => {
        // Payment successful â€” verify signature before finalising
        try {
          showToast('Verifying payment...');
          const verification = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verification && verification.verified) {
            showToast('Payment verified! Placing your orderâ€¦');
            await finaliseOrder(buildOrderData(), response.razorpay_payment_id);
          } else {
            showToast('Payment verification failed.', true);
            setPlacing(false);
          }
        } catch (err) {
          showToast('Verification error: ' + err.message, true);
          setPlacing(false);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      showToast(`Payment failed: ${resp.error.description}`, true);
      setPlacing(false);
    });
    rzp.open();
    // Don't setPlacing(false) here â€” handler or ondismiss will control it
  };

  /* â”€â”€ Step navigation â”€â”€ */
  const canProceed = () => {
    if (step === 1) return !!selectedAddress;
    if (step === 2) return cartItems.length > 0;
    if (step === 3) return validatePayment();
    return true;
  };

  const goNext = () => {
    if (!canProceed()) {
      if (step === 1) showToast('Please select or add a delivery address.', true);
      if (step === 3) showToast('Please complete payment details.', true);
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  /* â”€â”€ Input helper â”€â”€ */
  const inputCls = 'w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors';

  return (
    <>
      {/* â”€â”€ Page Header â”€â”€ */}
      <div className="bg-slate-800 border-b border-slate-700 py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif font-extrabold text-3xl text-white mb-4">Checkout</h1>

          {/* â”€â”€ Step Indicator â”€â”€ */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => step > s.id && setStep(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    step === s.id
                      ? 'text-slate-900 bg-teal-400'
                      : step > s.id
                      ? 'text-teal-400 cursor-pointer hover:bg-teal-400/10'
                      : 'text-slate-500 cursor-default'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step > s.id ? 'bg-teal-400 text-slate-900' : step === s.id ? 'bg-slate-900 text-teal-400' : 'bg-slate-700 text-slate-500'
                  }`}>
                    {step > s.id ? 'âœ“' : s.id}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded ${step > s.id ? 'bg-teal-400' : 'bg-slate-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€ Main Content â”€â”€ */}
      <section className="py-8 px-4 md:px-6 bg-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">

          {/* â”€â”€ Left Panel â”€â”€ */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 md:p-6">

            {/* â”€â”€ STEP 1: ADDRESS â”€â”€ */}
            {step === 1 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-teal-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /></svg>
                  Select Delivery Address
                </h3>

                {/* Saved addresses */}
                <div className="space-y-3 mb-5">
                  {addresses.length === 0 && !addingAddress && (
                    <p className="text-slate-400 text-sm">No saved addresses. Add one below.</p>
                  )}
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        selectedAddressId === addr.id
                          ? 'border-teal-400 bg-teal-400/5'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 accent-teal-400"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded">{addr.label}</span>
                          <span className="text-sm font-semibold text-white">{addr.name}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city} â€” {addr.pincode}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Ph: {addr.phone}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Toggle add form */}
                {!addingAddress ? (
                  <button
                    onClick={() => setAddingAddress(true)}
                    className="flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm font-semibold border border-teal-400/30 hover:border-teal-400/60 px-4 py-2.5 rounded-lg transition-all duration-200"
                  >
                    + Add New Address
                  </button>
                ) : (
                  <div className="border border-slate-600 rounded-xl p-4 bg-slate-900/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold text-sm">New Address</h4>
                      <button onClick={() => setAddingAddress(false)} className="text-slate-500 hover:text-white text-lg leading-none">Ã—</button>
                    </div>
                    <form onSubmit={onAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input value={newAddress.name}    onChange={(e) => setNewAddress((p) => ({ ...p, name: e.target.value }))}    placeholder="Full Name *"        className={inputCls} />
                      <input value={newAddress.label}   onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value.toUpperCase() }))} placeholder="Label (HOME/OFFICE)" className={inputCls} />
                      <input value={newAddress.line1}   onChange={(e) => setNewAddress((p) => ({ ...p, line1: e.target.value }))}   placeholder="Address Line 1 *"  className={`${inputCls} md:col-span-2`} />
                      <input value={newAddress.line2}   onChange={(e) => setNewAddress((p) => ({ ...p, line2: e.target.value }))}   placeholder="Address Line 2"    className={`${inputCls} md:col-span-2`} />
                      <input value={newAddress.city}    onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}    placeholder="City *"            className={inputCls} />
                      <input value={newAddress.pincode} onChange={(e) => setNewAddress((p) => ({ ...p, pincode: e.target.value }))} placeholder="Pincode *"         className={inputCls} />
                      <input value={newAddress.phone}   onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))}   placeholder="Phone *"           className={`${inputCls} md:col-span-2`} />
                      <div className="md:col-span-2 flex gap-3">
                        <button type="submit" className="bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm py-2.5 px-5 rounded-lg transition-all duration-200 active:scale-95">
                          Save Address
                        </button>
                        <button type="button" onClick={() => setAddingAddress(false)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm py-2.5 px-5 rounded-lg transition-all duration-200">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* â”€â”€ STEP 2: REVIEW â”€â”€ */}
            {step === 2 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <span>ðŸ“‹</span> Review Your Items
                </h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 border border-slate-700 rounded-xl p-3 hover:border-slate-600 transition-colors">
                      <div className="w-14 h-14 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                        {item.image
                          ? <img src={resolveProductImage(item.image)} alt={item.name} className="w-full h-full object-cover" />
                          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white leading-snug line-clamp-1">{item.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.unit}</div>
                        <div className="text-xs text-teal-400 mt-1">Qty: {item.qty}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-white">Rs. {item.qty * item.price}</div>
                        <div className="text-[11px] text-slate-500">Rs. {item.price} each</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery address summary */}
                {selectedAddress && (
                  <div className="mt-5 border border-teal-400/20 bg-teal-400/5 rounded-xl p-4">
                    <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Delivering To</div>
                    <div className="text-sm text-white font-semibold">{selectedAddress.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}, {selectedAddress.city} â€” {selectedAddress.pincode}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* â”€â”€ STEP 3: PAYMENT â”€â”€ */}
            {step === 3 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-teal-400 shrink-0"><rect x="2" y="5" width="20" height="14" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" /></svg>
                  Select Payment Method
                </h3>
                <div className="space-y-3 mb-5">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        paymentMethod === method.id
                          ? 'border-teal-400 bg-teal-400/5'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="accent-teal-400"
                      />
                      <div className="w-8 h-8 rounded-lg bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-teal-400 shrink-0">
                        {method.id === 'UPI' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14v-4m0 0V8m0 4h4m-4 0H8" /></svg>}
                        {method.id === 'CARD' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><rect x="2" y="5" width="20" height="14" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" /></svg>}
                        {method.id === 'COD' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{method.label}</div>
                        <div className="text-xs text-slate-400">{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* UPI input */}
                {paymentMethod === 'UPI' && (
                  <div className="border border-slate-700 rounded-xl p-4 bg-slate-900/50">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">UPI ID</label>
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className={inputCls}
                    />
                    <p className="text-xs text-slate-500 mt-2">Example: 7397148353@upi, name@okaxis</p>
                  </div>
                )}

                {/* Card inputs */}
                {paymentMethod === 'CARD' && (
                  <div className="border border-slate-700 rounded-xl p-4 bg-slate-900/50 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">Name on Card</label>
                      <input value={card.name} onChange={(e) => setCard((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">Card Number</label>
                      <input
                        value={card.number}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCard((p) => ({ ...p, number: v }));
                        }}
                        placeholder="1234 5678 9012 3456"
                        maxLength={16}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">Expiry (MM/YY)</label>
                      <input
                        value={card.expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                          setCard((p) => ({ ...p, expiry: v }));
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">CVV</label>
                      <input
                        value={card.cvv}
                        onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                        placeholder="â€¢â€¢â€¢"
                        maxLength={3}
                        type="password"
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}

                {/* COD */}
                {paymentMethod === 'COD' && (
                  <div className="border border-slate-700 rounded-xl p-4 bg-slate-900/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-teal-400 shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Cash on Delivery selected</div>
                      <div className="text-xs text-slate-400">Keep exact change ready. Delivery agent will collect on arrival.</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* â”€â”€ STEP 4: CONFIRM â”€â”€ */}
            {step === 4 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-teal-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                  Confirm & Place Order
                </h3>

                {/* Summary cards */}
                <div className="space-y-3 mb-6">
                  <div className="border border-slate-700 rounded-xl p-4">
                    <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Delivery Address</div>
                    {selectedAddress ? (
                      <>
                        <div className="text-sm font-semibold text-white">{selectedAddress.name} ({selectedAddress.label})</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}, {selectedAddress.city} â€” {selectedAddress.pincode}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Ph: {selectedAddress.phone}</div>
                      </>
                    ) : (
                      <p className="text-xs text-rose-400">No address selected</p>
                    )}
                  </div>

                  <div className="border border-slate-700 rounded-xl p-4">
                    <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Payment Method</div>
                    <div className="text-sm text-white font-semibold">
                      {paymentMethod === 'UPI' ? `UPI â€” ${upiId}` : paymentMethod === 'CARD' ? `Card ending in ${card.number.slice(-4)}` : 'Cash on Delivery'}
                    </div>
                  </div>

                  <div className="border border-slate-700 rounded-xl p-4">
                    <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Items ({cartItems.length})</div>
                    {cartItems.slice(0, 3).map((item) => (
                      <div key={item.productId} className="flex justify-between text-xs text-slate-400 py-0.5">
                        <span>{item.name} Ã— {item.qty}</span>
                        <span>Rs. {item.qty * item.price}</span>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <div className="text-xs text-slate-500 mt-1">+{cartItems.length - 3} more items</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-teal-400/20 ${
                    placing
                      ? 'bg-teal-500 text-slate-900 cursor-wait opacity-80'
                      : 'bg-teal-400 hover:bg-teal-500 text-slate-900'
                  }`}
                >
                  {placing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Placing Orderâ€¦
                    </span>
                  ) : (
                    `Place Order Â· Rs. ${cartTotal}`
                  )}
                </button>
              </div>
            )}

            {/* â”€â”€ Step Navigation â”€â”€ */}
            <div className="mt-8 flex justify-between items-center border-t border-slate-700 pt-5">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                  step === 1 ? 'text-slate-600 cursor-default' : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                disabled={step === 1}
              >
                â† Back
              </button>
              {step < 4 && (
                <button
                  onClick={goNext}
                  className="bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-2.5 rounded-lg transition-all duration-200 active:scale-95"
                >
                  Continue â†’
                </button>
              )}
            </div>
          </div>

          {/* â”€â”€ Right: Order Summary (sticky) â”€â”€ */}
          <aside className="bg-slate-800 border border-slate-700 rounded-xl p-5 lg:sticky lg:top-6">
            <h3 className="text-white font-bold text-base mb-4">Order Summary</h3>

            {/* Item list */}
            <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-xs text-slate-400">
                  <span className="line-clamp-1 flex-1 mr-2">{item.name} Ã— {item.qty}</span>
                  <span className="shrink-0">Rs. {item.qty * item.price}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>Rs. {cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-teal-400 font-semibold' : ''}>
                  {deliveryFee === 0 ? 'Free' : `Rs. ${deliveryFee}`}
                </span>
              </div>
              {deliveryFee > 0 && (
                <div className="text-[10px] text-slate-500">Add Rs. {Math.max(0, 500 - cartSubtotal)} more for free delivery</div>
              )}
              <div className="flex justify-between text-white font-bold border-t border-slate-700 pt-2 text-base">
                <span>Total</span>
                <span className="text-teal-400">Rs. {cartTotal}</span>
              </div>
            </div>

            <Link to="/cart" className="block mt-4 text-xs text-teal-400 hover:underline text-center">
              â† Edit Cart
            </Link>
          </aside>

        </div>
      </section>
    </>
  );
};

export default Checkout;
