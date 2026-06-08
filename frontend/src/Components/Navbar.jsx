import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Hooks';
import { showToast } from './Toast';
import { muiLogo } from '../Assets';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-teal-400 font-bold text-sm transition-colors duration-200 text-decoration-none relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-teal-400"
      : "text-slate-300 hover:text-teal-400 font-medium text-sm transition-colors duration-200 text-decoration-none relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-teal-400 hover:after:w-full after:transition-all after:duration-300";
  };

  const getMobileLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-teal-400 font-bold py-2 border-bottom border-slate-700 text-sm d-block transition-colors duration-200 text-decoration-none"
      : "text-slate-300 hover:text-teal-400 font-medium py-2 border-bottom border-slate-700 text-sm d-block transition-colors duration-200 text-decoration-none";
  };

  // ── Cart hook – provides real-time cart count ──────────────────────────────
  const { cartCount } = useCart();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    showToast('Logged out successfully. See you soon!');
    setTimeout(() => navigate('/'), 1200);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 px-4 md:px-6">
        <div className="container-xl d-flex align-items-center justify-content-between h-16 md:h-20 gap-4 p-0">
            {/* Logo */}
            <Link to="/" className="d-flex align-items-center gap-3 shrink-0 text-decoration-none">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 shadow-md shadow-teal-400/10">
                  <img src={muiLogo} alt="Eazeit" className="w-full h-full object-contain p-1.5" />
                </div>
                <div className="d-flex flex-column leading-none">
                    <span className="font-serif font-extrabold text-base tracking-widest text-teal-400">EAZEIT</span>
                    <span className="text-[8px] text-slate-400 tracking-[0.2em] uppercase mt-0.5">Anything Possible</span>
                </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="d-none d-md-flex align-items-center gap-8 shrink-0">
                <Link to="/" className={getLinkClass('/')}>Home</Link>
                <Link to="/products" className={getLinkClass('/products')}>Products</Link>
                <Link to="/about" className={getLinkClass('/about')}>About Us</Link>
                <Link to="/contact" className={getLinkClass('/contact')}>Contact</Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="d-none d-md-flex flex-grow-1 max-w-xs position-relative">
                <span className="position-absolute start-3 top-50 translate-middle-y text-slate-400 text-base">&#9906;</span>
                <input
                  type="text"
                  placeholder="Search for products..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      navigate(`/products?search=${encodeURIComponent(e.target.value.trim())}`);
                      e.target.value = '';
                    }
                  }}
                  className="form-control ps-5 py-2 bg-slate-800 border-slate-700 text-white placeholder-slate-400 text-sm focus:border-teal-400 focus:shadow-none transition-colors duration-200"
                />
            </div>

            {/* Desktop Right Actions */}
            <div className="d-none d-md-flex align-items-center gap-4 shrink-0">
                {/* Cart Link – shows real count from useCart */}
                <Link
                  to="/cart"
                  className="relative text-slate-300 hover:text-teal-400 border border-slate-700 hover:border-teal-400 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 text-decoration-none d-flex align-items-center gap-1.5"
                >
                  🛒 Cart
                  {cartCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-400 text-slate-900 text-[10px] font-extrabold">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Auth section */}
                {user ? (
                  <div className="position-relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-400 text-slate-300 hover:text-teal-400 transition-colors duration-200"
                    >
                      <div className="w-6 h-6 rounded-full bg-teal-400 text-slate-950 d-flex align-items-center justify-center text-xs font-bold uppercase shrink-0">
                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">
                        Hello, {user.firstName}
                      </span>
                      <span className="text-[10px] transition-transform duration-200 select-none">
                        {isProfileOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div 
                        className="position-absolute end-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-fade-in d-flex flex-column gap-1"
                        style={{ top: '100%' }}
                      >
                        {/* User Header Info */}
                        <div className="px-3 py-2 border-bottom border-slate-700/60">
                          <p className="text-[10px] text-slate-400 m-0 uppercase tracking-wider">Signed in as</p>
                          <p className="text-sm font-bold text-white truncate m-0 mt-1">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-teal-400 truncate m-0 mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        {/* Menu Links */}
                        <div className="px-2 py-1 d-flex flex-column gap-1">
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="d-flex align-items-center gap-2 px-3 py-2 rounded-lg text-purple-400 hover:bg-purple-500/10 text-xs font-extrabold tracking-wider uppercase text-decoration-none transition-colors"
                            >
                              👑 Admin Dashboard
                            </Link>
                          )}
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="d-flex align-items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-teal-400 text-sm font-medium text-decoration-none transition-colors"
                          >
                            👤 My Profile
                          </Link>
                          <Link
                            to="/profile?tab=orders-tab"
                            onClick={() => setIsProfileOpen(false)}
                            className="d-flex align-items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-teal-400 text-sm font-medium text-decoration-none transition-colors"
                          >
                            🚚 My Orders
                          </Link>
                          <Link
                            to="/profile?tab=addresses-tab"
                            onClick={() => setIsProfileOpen(false)}
                            className="d-flex align-items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-teal-400 text-sm font-medium text-decoration-none transition-colors"
                          >
                            📍 Saved Addresses
                          </Link>
                        </div>

                        {/* Logout Button */}
                        <div className="border-top border-slate-700/60 px-2 pt-1.5">
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              handleLogout();
                            }}
                            className="w-full d-flex align-items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 text-sm font-bold text-left border-0 bg-transparent transition-colors"
                          >
                            🚪 Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="btn bg-teal-400 hover:bg-teal-500 text-slate-900 fw-semibold text-sm px-5 py-1.5 rounded-lg transition-all duration-200 active:scale-95 border-0 text-decoration-none font-bold">Login</Link>
                )}
            </div>

            {/* Mobile hamburger toggle */}
            <label className="d-md-none d-flex flex-column gap-1.5 cursor-pointer p-2" htmlFor="mobile-toggle">
                <span className="w-6 h-0.5 bg-white rounded transition-all duration-300"></span>
                <span className="w-6 h-0.5 bg-white rounded transition-all duration-300"></span>
                <span className="w-6 h-0.5 bg-white rounded transition-all duration-300"></span>
            </label>
        </div>

        {/* Mobile Dropdown */}
        <input type="checkbox" id="mobile-toggle" className="peer d-none" />
        <div className="d-none peer-checked:flex d-md-none position-absolute top-100 start-0 end-0 bg-slate-800 border-bottom border-slate-700 p-4 flex-column gap-3 shadow-xl animate-[fadeIn_0.2s_ease-out]">
            <Link to="/" className={getMobileLinkClass('/')}>Home</Link>
            <Link to="/products" className={getMobileLinkClass('/products')}>Products</Link>
            <Link to="/about" className={getMobileLinkClass('/about')}>About Us</Link>
            <Link to="/contact" className={getMobileLinkClass('/contact')}>Contact</Link>
            {/* Cart with badge in mobile menu */}
            <Link to="/cart" className="text-slate-300 hover:text-teal-400 font-medium py-2 border-bottom border-slate-700 text-sm d-flex align-items-center gap-2 transition-colors duration-200 text-decoration-none">
              🛒 Cart
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-400 text-slate-900 text-[10px] font-extrabold">{cartCount}</span>
              )}
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-purple-400 hover:text-purple-300 font-semibold py-2 border-bottom border-slate-700 text-sm d-block transition-colors duration-200 text-decoration-none">👑 Admin Panel</Link>
                )}
                <Link to="/profile?tab=orders-tab" className="text-slate-300 hover:text-teal-400 font-medium py-2 border-bottom border-slate-700 text-sm d-block transition-colors duration-200 text-decoration-none">My Orders</Link>
                <Link to="/profile" className="text-slate-300 hover:text-teal-400 font-medium py-2 border-bottom border-slate-700 text-sm d-block transition-colors duration-200 text-decoration-none">My Profile</Link>
                <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 font-medium py-2 border-bottom border-slate-700 text-sm text-left d-block transition-colors duration-200 bg-transparent border-0 w-full p-0">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-slate-300 hover:text-teal-400 font-medium py-2 text-sm d-block transition-colors duration-200 text-decoration-none">Login</Link>
            )}
        </div>
    </nav>
  );
};

export default Navbar;