import React from 'react';
import { Link } from 'react-router-dom';
import { muiLogo } from '../Assets';

const Footer = () => {
  return (
    <footer className="bg-slate-800 border-top border-slate-700 pt-5 pb-4 px-4 md:px-6">
      <div className="container-xl">
        <div className="row g-4 pb-5 border-bottom border-slate-700/60">

          {/* ── Brand + Contact ── */}
          <div className="col-md-3 d-flex flex-column gap-3">
            <Link to="/" className="d-flex align-items-center gap-3 shrink-0 text-decoration-none">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg overflow-hidden border border-slate-700 shadow-md shadow-teal-400/10">
                <img src={muiLogo} alt="E" className="w-full h-full object-contain p-1.5" />
              </div>
              <span className="font-serif font-extrabold text-base tracking-widest text-teal-400">EAZEIT</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed m-0">
              EAZEIT makes grocery shopping effortless. Quality products delivered to your doorstep with speed and reliability.
            </p>
            <div className="text-xs text-slate-300 d-flex flex-column gap-1">
              <div>
                Email:{' '}
                <a href="mailto:saravana24057@gmail.com" className="hover:text-teal-400 transition-colors text-decoration-none">
                  saravana24057@gmail.com
                </a>
              </div>
              <div>
                Phone:{' '}
                <a href="tel:+917397148353" className="hover:text-teal-400 transition-colors text-decoration-none">
                  7397148353
                </a>
              </div>
              <div>Address: Kondampatti post, Vadasithur via, Kinathukadavu.</div>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="col-md-3 d-flex flex-column gap-3">
            <h3 className="text-sm fw-bold text-white text-uppercase tracking-wider m-0">Quick Links</h3>
            <div className="d-flex flex-column gap-2 text-xs text-slate-400">
              <Link to="/"         className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Home</Link>
              <Link to="/products" className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Products</Link>
              <Link to="/about"    className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">About Us</Link>
              <Link to="/contact"  className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Contact</Link>
              <Link to="/faq"      className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">FAQ</Link>
            </div>
          </div>

          {/* ── My Account ── */}
          <div className="col-md-3 d-flex flex-column gap-3">
            <h3 className="text-sm fw-bold text-white text-uppercase tracking-wider m-0">My Account</h3>
            <div className="d-flex flex-column gap-2 text-xs text-slate-400">
              <Link to="/login"           className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Login</Link>
              <Link to="/signup"          className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Register</Link>
              <Link to="/forgot-password" className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Forgot Password</Link>
              <Link to="/admin"           className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Admin Panel</Link>
            </div>
          </div>

          {/* ── Policies ── */}
          <div className="col-md-3 d-flex flex-column gap-3">
            <h3 className="text-sm fw-bold text-white text-uppercase tracking-wider m-0">Policies</h3>
            <div className="d-flex flex-column gap-2 text-xs text-slate-400">
              <Link to="/privacy" className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Privacy Policy</Link>
              <Link to="/terms"   className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Terms &amp; Conditions</Link>
              <Link to="/faq"     className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Frequently Asked Questions</Link>
            </div>
          </div>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="pt-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-xs text-slate-400">
          <p className="order-2 order-md-1 m-0">CopyRights &copy; 2026 EAZEIT. All Rights Reserved.</p>
          <div className="d-flex gap-4 order-1 order-md-2">
            <Link to="/privacy" className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Privacy</Link>
            <Link to="/terms"   className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Terms</Link>
            <Link to="/contact" className="hover:text-teal-400 transition-colors text-decoration-none text-slate-400">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;