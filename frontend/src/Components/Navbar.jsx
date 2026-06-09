import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Hooks';
import { showToast } from './Toast';
import { muiLogo } from '../Assets';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

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

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setIsProfileOpen(false);
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
            <div className="d-none d-md-flex align-items-center gap-3 shrink-0">
                {/* Cart Link */}
                <Link
                  to="/cart"
                  className="relative d-flex align-items-center gap-2 text-slate-300 hover:text-teal-400 border border-slate-700 hover:border-teal-400 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 text-decoration-none"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'16px',height:'16px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
                  </svg>
                  Cart
                  {cartCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-400 text-slate-900 text-[10px] font-extrabold">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Auth section */}
                {user ? (
                  <div className="d-flex align-items-center gap-2">
                    {/* Admin badge — shield icon only, no text */}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        title="Admin Panel"
                        className="d-flex align-items-center justify-center w-9 h-9 rounded-lg bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 hover:border-purple-400 text-purple-400 hover:text-purple-300 text-decoration-none transition-all duration-200 group"
                      >
                        {/* Shield / Crown icon */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'16px',height:'16px'}} className="group-hover:scale-110 transition-transform duration-200">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </Link>
                    )}

                    {/* Profile avatar — click opens dropdown */}
                    <div className="position-relative" ref={profileRef}>
                      <button
                        onClick={() => setIsProfileOpen((v) => !v)}
                        title={`${user.firstName} ${user.lastName} — View Profile`}
                        className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-400 text-slate-300 hover:text-teal-400 transition-all duration-200"
                        style={{border:'none',background:'none',padding:0}}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-slate-950 d-flex align-items-center justify-center text-xs font-bold uppercase shrink-0 shadow-md shadow-teal-400/20">
                          {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                        </div>
                        {/* Chevron */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          style={{width:'12px',height:'12px',transition:'transform 0.2s',transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}
                          className="text-slate-400"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown panel */}
                      {isProfileOpen && (
                        <div
                          className="position-absolute end-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-slate-950/70 overflow-hidden"
                          style={{top:'100%', minWidth:'220px', zIndex:9999, animation:'fadeSlideDown 0.18s ease-out'}}
                        >
                          {/* User info header */}
                          <div className="px-4 py-4 border-b border-slate-700/60 d-flex align-items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-slate-950 d-flex align-items-center justify-center text-sm font-bold uppercase shrink-0">
                              {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</div>
                              <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                              {user.role === 'admin' && (
                                <span className="inline-block mt-1 text-[9px] bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded font-bold uppercase tracking-wide">Admin</span>
                              )}
                            </div>
                          </div>

                          {/* Menu items */}
                          <div className="py-1.5">
                            <Link
                              to="/profile"
                              onClick={() => setIsProfileOpen(false)}
                              className="d-flex align-items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors text-decoration-none"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'15px',height:'15px'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zM4 22c0-4.418 3.582-8 8-8s8 3.582 8 8" />
                              </svg>
                              My Profile
                            </Link>
                            <Link
                              to="/profile?tab=orders-tab"
                              onClick={() => setIsProfileOpen(false)}
                              className="d-flex align-items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors text-decoration-none"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'15px',height:'15px'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                              </svg>
                              My Orders
                            </Link>
                            {user.role === 'admin' && (
                              <Link
                                to="/admin"
                                onClick={() => setIsProfileOpen(false)}
                                className="d-flex align-items-center gap-3 px-4 py-2.5 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors text-decoration-none"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'15px',height:'15px'}}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                Admin Panel
                              </Link>
                            )}
                          </div>

                          {/* Logout */}
                          <div className="border-t border-slate-700/60 py-1.5">
                            <button
                              onClick={handleLogout}
                              className="w-full d-flex align-items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left bg-transparent border-0"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'15px',height:'15px'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" />
                              </svg>
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'15px',height:'15px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-400 text-slate-900 text-[10px] font-extrabold">{cartCount}</span>
              )}
            </Link>
            {user ? (
              <>
                {/* Mobile profile summary */}
                <div className="d-flex align-items-center gap-3 py-2 border-bottom border-slate-700">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-slate-950 d-flex align-items-center justify-center text-xs font-bold uppercase shrink-0">
                    {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{user.firstName} {user.lastName}</div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" className="d-flex align-items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold py-2 border-bottom border-slate-700 text-sm transition-colors duration-200 text-decoration-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'14px',height:'14px'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Admin Panel
                  </Link>
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