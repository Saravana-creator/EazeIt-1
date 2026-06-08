import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Hooks';
import { showToast } from './Toast';
import { muiLogo } from '../Assets';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
                    {/* Admin badge */}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 text-xs font-bold uppercase tracking-wider text-decoration-none transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'13px',height:'13px'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Admin
                      </Link>
                    )}

                    {/* Profile avatar — navigates directly to /profile */}
                    <Link
                      to="/profile"
                      title={`${user.firstName} ${user.lastName} — View Profile`}
                      className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-400 text-slate-300 hover:text-teal-400 transition-colors duration-200 text-decoration-none"
                    >
                      <div className="w-6 h-6 rounded-full bg-teal-400 text-slate-950 d-flex align-items-center justify-center text-xs font-bold uppercase shrink-0">
                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {user.firstName}
                      </span>
                    </Link>

                    {/* Logout icon button */}
                    <button
                      onClick={handleLogout}
                      title="Logout"
                      className="d-flex align-items-center justify-center w-8 h-8 rounded-lg border border-slate-700 hover:border-rose-500/50 bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors duration-200"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'15px',height:'15px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
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
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-purple-400 hover:text-purple-300 font-semibold py-2 border-bottom border-slate-700 text-sm d-block transition-colors duration-200 text-decoration-none">Admin Panel</Link>
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