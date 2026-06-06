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
                  <img src={muiLogo} alt="Eazeit" className="w-full h-full object-cover" />
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
                  <div className="d-flex align-items-center gap-3">
                    {user.role === 'admin' && (
                      <Link to="/admin" className="text-purple-400 hover:text-purple-300 font-semibold text-xs border border-purple-400/30 px-2.5 py-1.5 rounded-lg text-decoration-none uppercase tracking-wider bg-purple-400/5 hover:bg-purple-400/10 transition-colors">
                        👑 Admin
                      </Link>
                    )}
                    <Link to="/profile" className="text-teal-400 hover:text-teal-300 font-semibold text-sm transition-colors duration-200 text-decoration-none flex items-center gap-1.5">
                      Hello, {user.firstName}
                    </Link>
                    <button onClick={handleLogout} className="bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-slate-900 border border-rose-500/40 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all duration-200 active:scale-95">
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="btn bg-teal-400 hover:bg-teal-500 text-slate-900 fw-semibold text-sm px-4 py-1.5 rounded-lg transition-all duration-200 active:scale-95 border-0">Login / Register</Link>
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
                <Link to="/profile" className="text-slate-300 hover:text-teal-400 font-medium py-2 border-bottom border-slate-700 text-sm d-block transition-colors duration-200 text-decoration-none">My Profile</Link>
                <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 font-medium py-2 border-bottom border-slate-700 text-sm text-left d-block transition-colors duration-200 bg-transparent border-0 w-full p-0">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-teal-400 font-medium py-2 border-bottom border-slate-700 text-sm d-block transition-colors duration-200 text-decoration-none">Login</Link>
                <Link to="/signup" className="text-slate-300 hover:text-teal-400 font-medium py-2 text-sm d-block transition-colors duration-200 text-decoration-none">Register</Link>
              </>
            )}
        </div>
    </nav>
  );
};

export default Navbar;