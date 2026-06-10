import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getOrdersForUser, formatOrderDate } from '../utils/orders';
import { getAddressesForUser, deleteAddress, seedDefaultAddresses } from '../utils/addresses';
import { showToast } from '../Components/Toast';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile-tab');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Edit form state
  const [editForm, setEditForm] = useState({ firstname: '', lastname: '', mobile: '', password: '' });
  const [editErrors, setEditErrors] = useState({ firstname: '', lastname: '', mobile: '', password: '' });
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Auth guard: redirect if no session
  useEffect(() => {
    const userJSON = sessionStorage.getItem('eazeit_active_user');
    if (!userJSON) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userJSON);
    setUser(parsedUser);
    setEditForm({
      firstname: parsedUser.firstName || '',
      lastname: parsedUser.lastName || '',
      mobile: parsedUser.mobile || '',
      password: ''
    });
    seedDefaultAddresses(parsedUser.email);
    setOrders(getOrdersForUser(parsedUser.email));
    setAddresses(getAddressesForUser(parsedUser.email));
  }, [navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleLogout = () => {
    sessionStorage.removeItem('eazeit_active_user');
    showToast('Logged out successfully. See you soon!');
    setTimeout(() => navigate('/'), 1200);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    setEditErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const nameRegex = /^[a-zA-Z]+$/;
    const mobileRegex = /^[6-9][0-9]{9}$/;
    let hasErrors = false;
    const newErrors = { firstname: '', lastname: '', mobile: '', password: '' };

    if (!nameRegex.test(editForm.firstname.trim())) {
      newErrors.firstname = 'Only alphabetic letters are allowed.';
      hasErrors = true;
    }
    if (!nameRegex.test(editForm.lastname.trim())) {
      newErrors.lastname = 'Only alphabetic letters are allowed.';
      hasErrors = true;
    }
    if (!mobileRegex.test(editForm.mobile.trim())) {
      newErrors.mobile = 'Must start with 6-9 and have exactly 10 digits.';
      hasErrors = true;
    }

    // Verify password (admin doesn't need password check against DB)
    if (user.role !== 'admin') {
      const usersDatabase = JSON.parse(localStorage.getItem('eazeit_users')) || [];
      const dbUser = usersDatabase.find(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (!dbUser || dbUser.password !== editForm.password) {
        newErrors.password = 'Password incorrect! Cannot update.';
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setEditErrors(newErrors);
      return;
    }

    // Apply updates
    if (user.role !== 'admin') {
      const usersDatabase = JSON.parse(localStorage.getItem('eazeit_users')) || [];
      const updatedDb = usersDatabase.map(u => {
        if (u.email.toLowerCase() === user.email.toLowerCase()) {
          return { ...u, firstName: editForm.firstname.trim(), lastName: editForm.lastname.trim(), mobile: editForm.mobile.trim() };
        }
        return u;
      });
      localStorage.setItem('eazeit_users', JSON.stringify(updatedDb));
    }

    const updatedUser = { ...user, firstName: editForm.firstname.trim(), lastName: editForm.lastname.trim(), mobile: editForm.mobile.trim() };
    sessionStorage.setItem('eazeit_active_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditForm(prev => ({ ...prev, password: '' }));
    showToast('Profile updated successfully!');
  };

  const handleDeleteAddress = (addressId) => {
    if (!user) return;
    const updated = deleteAddress(user.email, addressId);
    setAddresses(updated);
    showToast('Address removed.');
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  if (!user) return null;

  const tabBtnClass = (tab) =>
    `w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-3 ${activeTab === tab ? 'bg-teal-400 text-slate-950' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`;

  return (
    <>
      {/*  ===== MAIN DASHBOARD LAYOUT =====  */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 md:px-6">
        
        {/*  Welcome Header Banner  */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-900 border border-slate-700/80 rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 rounded-2xl bg-teal-400/10 border border-teal-400/30 flex items-center justify-center text-xs font-extrabold text-teal-400 shadow-inner shadow-teal-400/10 uppercase tracking-widest">
              {getInitials()}
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-white mb-1">
                Welcome back, <span className="text-teal-400">{user.firstName}</span>!
              </h1>
              <p className="text-slate-400 text-xs md:text-sm">Manage your account profile, track orders, and edit shipping credentials.</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-rose-500/15"
          >
            Logout Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/*  SIDEBAR  */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/*  Profile Summary Card  */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg shadow-slate-950/20">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-700/60">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-400 to-teal-500 flex items-center justify-center text-slate-950 text-3xl font-extrabold shadow-lg shadow-teal-400/10 mb-3">
                  <span>{getInitials()}</span>
                </div>
                <h2 className="font-serif font-bold text-lg text-white mb-0.5">{user.firstName} {user.lastName}</h2>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>

              <div className="mt-6 flex flex-col gap-4 text-sm">
                <div className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 text-xs">Mobile Number</span>
                  <span className="font-semibold text-teal-400">+91 {user.mobile || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 text-xs">Account Country</span>
                  <span className="font-semibold text-slate-200">India (IN)</span>
                </div>
                {user.role === 'admin' && (
                  <div className="flex justify-between items-center bg-teal-400/10 p-2.5 rounded-lg border border-teal-400/20">
                    <span className="text-slate-400 text-xs">Role</span>
                    <span className="font-bold text-teal-400 text-xs uppercase tracking-wider">Administrator</span>
                  </div>
                )}
              </div>
            </div>

            {/*  Dashboard Menu Toggles  */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg shadow-slate-950/20 flex flex-col gap-2">
              <button onClick={() => setActiveTab('profile-tab')} id="btn-profile-tab" className={tabBtnClass('profile-tab')}>
                &#9998; Edit Account Credentials
              </button>
              <button onClick={() => setActiveTab('orders-tab')} id="btn-orders-tab" className={tabBtnClass('orders-tab')}>
                &#128666; Order History
              </button>
              <button onClick={() => setActiveTab('addresses-tab')} id="btn-addresses-tab" className={tabBtnClass('addresses-tab')}>
                &#128205; Saved Addresses
              </button>
              {user.role === 'admin' && (
                <Link to="/admin" className="w-full text-left px-4 py-3 rounded-xl font-semibold text-sm text-slate-300 hover:bg-teal-400/10 hover:text-teal-400 transition-all duration-200 flex items-center gap-3">
                  &#128202; Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/*  MAIN PANEL  */}
          <div className="lg:col-span-8">

            {/*  TAB 1: Edit Profile  */}
            {activeTab === 'profile-tab' && (
              <div id="profile-tab" className="tab-content bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-lg shadow-slate-950/20">
                <h3 className="font-serif font-bold text-xl text-white mb-2">Edit Account Profile</h3>
                <p className="text-slate-400 text-xs md:text-sm mb-6">Modify your first/last name or mobile number. Password confirmation is required.</p>

                <form id="edit-profile-form" onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-firstname" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">First Name</label>
                      <input type="text" id="edit-firstname" name="firstname" required value={editForm.firstname} onChange={handleEditChange}
                        className={`w-full px-4 py-3 bg-slate-900 border ${editErrors.firstname ? 'border-rose-500' : 'border-slate-700'} rounded-lg text-white text-sm focus:outline-none focus:border-teal-400 transition-colors`} />
                      {editErrors.firstname && <span className="text-rose-500 text-[10px] mt-0.5">{editErrors.firstname}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-lastname" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Last Name</label>
                      <input type="text" id="edit-lastname" name="lastname" required value={editForm.lastname} onChange={handleEditChange}
                        className={`w-full px-4 py-3 bg-slate-900 border ${editErrors.lastname ? 'border-rose-500' : 'border-slate-700'} rounded-lg text-white text-sm focus:outline-none focus:border-teal-400 transition-colors`} />
                      {editErrors.lastname && <span className="text-rose-500 text-[10px] mt-0.5">{editErrors.lastname}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address (Cannot change)</label>
                    <input type="email" id="edit-email" disabled value={user.email}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 text-sm cursor-not-allowed" />
                    <span className="text-[10px] text-slate-500 mt-0.5">Email address acts as your account primary ID.</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-mobile" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Mobile Number</label>
                    <div className="flex gap-2">
                      <select id="edit-country" className="px-2 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none w-24">
                        <option value="+91">+91 (IN)</option>
                      </select>
                      <input type="tel" id="edit-mobile" name="mobile" required value={editForm.mobile} onChange={handleEditChange}
                        className={`flex-1 px-4 py-3 bg-slate-900 border ${editErrors.mobile ? 'border-rose-500' : 'border-slate-700'} rounded-lg text-white text-sm focus:outline-none focus:border-teal-400 transition-colors`} />
                    </div>
                    {editErrors.mobile && <span className="text-rose-500 text-[10px] mt-0.5">{editErrors.mobile}</span>}
                  </div>

                  {user.role !== 'admin' && (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Account Password (Required to save)</label>
                      <div className="relative">
                        <input
                          type={showEditPassword ? 'text' : 'password'}
                          id="edit-password"
                          name="password"
                          placeholder="Confirm your password to apply changes"
                          required
                          value={editForm.password}
                          onChange={handleEditChange}
                          className={`w-full px-4 py-3 pr-10 bg-slate-900 border ${editErrors.password ? 'border-rose-500' : 'border-slate-700'} rounded-lg text-white text-sm focus:outline-none focus:border-teal-400 transition-colors`}
                        />
                        <button type="button" id="toggle-edit-password" onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-teal-400 transition-colors">
                          {showEditPassword
                            ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                            : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          }
                        </button>
                      </div>
                      {editErrors.password && <span className="text-rose-500 text-[10px] mt-0.5">{editErrors.password}</span>}
                    </div>
                  )}

                  <button type="submit" className="w-full mt-2 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-3.5 rounded-lg transition-all duration-200 active:scale-95 shadow-lg shadow-teal-400/15">
                    Save Profile Changes
                  </button>
                </form>
              </div>
            )}

            {/*  TAB 2: Order History  */}
            {activeTab === 'orders-tab' && (
              <div id="orders-tab" className="tab-content bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-lg shadow-slate-950/20">
                <h3 className="font-serif font-bold text-xl text-white mb-2">Order History</h3>
                <p className="text-slate-400 text-xs md:text-sm mb-6">Review your past grocery and daily essentials orders purchased from EAZEIT.</p>

                {orders.length === 0 ? (
                  <div className="border border-slate-700/80 rounded-xl p-6 bg-slate-900/30 text-center text-sm text-slate-400">
                    No orders yet. Place your first order from the products page.
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-slate-700/80 rounded-xl p-4 bg-slate-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-teal-400">EZ</div>
                          <div>
                            <div className="text-sm font-semibold text-white">Order #{order.id}</div>
                            <div className="text-xs text-slate-400">{formatOrderDate(order.placedAt)} &bull; {order.items.length} Items &bull; Rs. {order.total}</div>
                            <div className="text-[10px] text-slate-500 mt-1">{order.items.map((item) => item.name).join(', ')}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-right">
                          <span className="bg-teal-400/10 text-teal-400 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full border border-teal-400/20">{order.status || 'Delivered'}</span>
                          <span className="text-[10px] text-slate-500">{formatOrderDate(order.placedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/*  TAB 3: Saved Addresses  */}
            {activeTab === 'addresses-tab' && (
              <div id="addresses-tab" className="tab-content bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-lg shadow-slate-950/20">
                <h3 className="font-serif font-bold text-xl text-white mb-2">Saved Delivery Addresses</h3>
                <p className="text-slate-400 text-xs md:text-sm mb-6">Manage your saved home, office, and other shipping destinations.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-slate-700/80 rounded-xl p-4 bg-slate-900/30 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-teal-400 text-xs font-bold mr-1">{address.label}</span>
                        <span className="text-sm font-bold text-white">{address.name}</span>
                        {address.isDefault && <span className="text-[9px] bg-teal-400/10 border border-teal-400/30 text-teal-400 font-semibold px-2 py-0.5 rounded-full ml-auto">Default</span>}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {address.line1}, {address.line2}<br />
                        {address.city} - {address.pincode}
                      </p>
                      <div className="mt-4 flex gap-3 text-[10px]">
                        <button className="text-slate-400 font-bold">Phone: {address.phone}</button>
                        <button onClick={() => handleDeleteAddress(address.id)} className="text-rose-400 font-bold hover:underline">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </>
  );
};

export default Profile;
