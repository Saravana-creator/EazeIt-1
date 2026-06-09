/**
 * Login Page
 * ----------
 * Hooks used:
 *   useState       — controlled form inputs (email, password, showPassword)
 *   useNavigate    — redirect after login
 *   useAuth        — custom hook: login() persists session, user to check existing session
 *
 * Props: None (page-level component)
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Hooks';
import { showToast } from '../Components/Toast';
import { apiLogin } from '../Utils/api';
import { muiLogo } from '../Assets';

/* ── Eye SVG sub-components (pure UI, no state) ─────────────────────────── */
const EyeOpen = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOff = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
  </svg>
);

const ADMIN_EMAIL    = 'suryasekar626@gmail.com';
const ADMIN_PASSWORD = 'surya@123';

const Login = () => {
  // ── Controlled input state ────────────────────────────────────────────────
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const navigate    = useNavigate();
  const { login, user }   = useAuth();  // custom hook — handles sessionStorage write

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try backend API login
    try {
      const user = await apiLogin(trimmedEmail, password);
      login(user);
      showToast(`Welcome back, ${user.firstName || 'User'}! 🎉`);
      if (user.role === 'admin') {
        setTimeout(() => navigate('/admin'), 1200);
      } else {
        setTimeout(() => navigate('/'), 1200);
      }
      return;
    } catch (error) {
      const isNetworkError = error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch');
      if (!isNetworkError) {
        // Actual credential mismatch or request error returned by the server
        showToast(error.message, true);
        setPassword('');
        return;
      }
      // Server is offline, so we proceed to fallback
      console.warn('Backend server offline. Falling back to local offline mode.');
    }

    // 2. Fallback: Admin verification (offline)
    if (trimmedEmail === ADMIN_EMAIL.toLowerCase()) {
      if (password === ADMIN_PASSWORD) {
        const adminUser = { firstName: 'Admin', lastName: 'EAZEIT', email: ADMIN_EMAIL, role: 'admin' };
        login(adminUser);
        showToast('Admin login successful (Offline)! Redirecting…');
        setTimeout(() => navigate('/admin'), 1200);
      } else {
        showToast('Incorrect admin password.', true);
        setPassword('');
      }
      return;
    }

    // 3. Server is offline — regular users cannot login without backend
    showToast('Server is currently unreachable. Please try again shortly.', true);
    setPassword('');
  };

  return (
    <>
      <main className="flex items-center justify-center py-12 px-4 bg-slate-900 min-h-screen relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 md:p-10 shadow-xl shadow-slate-950/50">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shadow-lg shadow-teal-400/20 mb-5">
              <img src={muiLogo} alt="Eazeit Logo" className="w-full h-full object-contain p-1.5" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-white mb-1">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Login to your EAZEIT account</p>
          </div>

          {/* Form — controlled inputs using useState */}
          <form id="login-form" onSubmit={handleLoginSubmit} className="flex flex-col gap-5">

            {/* Email — controlled via useState(email) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
              <input
                type="email" id="login-email" name="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 transition-colors"
              />
            </div>

            {/* Password — controlled via useState(password) + showPassword toggle */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password" name="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 transition-colors"
                />
                {/* Toggle visibility — updates showPassword state via useState */}
                <button
                  type="button" id="toggle-login-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-teal-400 transition-colors"
                >
                  {showPassword ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <div className="text-right -mt-2">
              <Link to="/forgot-password" className="text-xs font-medium text-teal-400 hover:underline">Forgot your password?</Link>
            </div>

            <button
              type="submit"
              className="w-full mt-1 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-teal-400/20"
            >
              Login to Account
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-col items-center gap-3 text-sm text-slate-400">
            <span>Don't have an account? <Link to="/signup" className="text-teal-400 hover:underline font-semibold">Create one here</Link></span>
            <Link to="/" className="text-slate-300 hover:text-white transition-colors text-xs">← Back to Home</Link>
          </div>

        </div>
      </main>
    </>
  );
};

export default Login;