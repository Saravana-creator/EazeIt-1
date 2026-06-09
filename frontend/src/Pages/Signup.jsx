/**
 * Signup Page
 * -----------
 * Hooks used:
 *   useState              — formData (controlled inputs), errors, visibility toggles
 *   useNavigate           — redirect after registration
 *   useAuth               — custom hook: login() persists new user to sessionStorage
 *   usePasswordStrength   — custom hook: derives strength meter state from password
 *
 * Props: None (page-level component)
 *
 * Props passed down:
 *   - <EyeButton visible={bool} onToggle={fn} />  — receives props visible + onToggle
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Hooks';
import { usePasswordStrength } from '../Hooks';
import { showToast } from '../Components/Toast';
import { apiSignUp } from '../Utils/api';
import { muiLogo } from '../Assets';

/* ─── Eye toggle button — receives props: visible, onToggle, id ─────────── */
const EyeButton = ({ visible, onToggle, id }) => (
  <button type="button" id={id} onClick={onToggle}
    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-teal-400 transition-colors"
  >
    {visible ? (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
      </svg>
    ) : (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
);

/* ─── Strength Meter — receives props: strength ─────────────────────────── */
const StrengthMeter = ({ strength }) => (
  <div className="mt-1 flex flex-col gap-1">
    <div className="flex h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full ${strength.colorClass} transition-all duration-300`} style={{ width: strength.width }} />
    </div>
    <div className="flex justify-between text-[10px] font-medium">
      <span className={strength.textClass}>{strength.text}</span>
      <span className="text-slate-400">Min 6 characters</span>
    </div>
  </div>
);

/* ─── Input field + error — receives props: label, error, children ───────── */
const FormField = ({ label, htmlFor, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>
    {children}
    {error && <span className="text-rose-500 text-[10px] mt-0.5">{error}</span>}
  </div>
);

// Validation regex constants
const NAME_REGEX   = /^[a-zA-Z]+$/;
const EMAIL_REGEX  = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MOBILE_REGEX = /^[6-9][0-9]{9}$/;

const EMPTY_FORM = { firstname: '', lastname: '', email: '', mobile: '', password: '', confirmPassword: '', terms: false };
const EMPTY_ERR  = { firstname: '', lastname: '', email: '', mobile: '', password: '', confirmPassword: '' };

const Signup = () => {
  // ── State hooks ──────────────────────────────────────────────────────────
  const [formData, setFormData]           = useState(EMPTY_FORM);
  const [errors,   setErrors]             = useState(EMPTY_ERR);
  const [showPassword,        setSP]      = useState(false);
  const [showConfirmPassword, setSCP]     = useState(false);

  // ── Custom hooks ─────────────────────────────────────────────────────────
  const navigate            = useNavigate();
  const { login, user }     = useAuth();                                // session hook
  const strength            = usePasswordStrength(formData.password);   // strength hook

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  // ── Field validation ─────────────────────────────────────────────────────
  const validateField = (name, value) => {
    let msg = '';
    if ((name === 'firstname' || name === 'lastname')) {
      if (!value.trim()) msg = 'Field is required';
      else if (!NAME_REGEX.test(value.trim())) msg = 'Only alphabetic letters allowed';
    }
    if (name === 'email') {
      if (!value.trim()) msg = 'Email is required';
      else if (!EMAIL_REGEX.test(value.trim())) msg = 'Invalid email format';
    }
    if (name === 'mobile') {
      if (!value.trim()) msg = 'Mobile number is required';
      else if (!MOBILE_REGEX.test(value.trim())) msg = 'Must start with 6-9 and have 10 digits';
    }
    if (name === 'confirmPassword') {
      if (!value) msg = 'Please confirm your password';
      else if (value !== formData.password) msg = 'Passwords do not match';
    }
    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  // ── Controlled input handler ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      if (name !== 'password' && name !== 'terms') validateField(name, val);
      if (name === 'password' && updated.confirmPassword) {
        setErrors((prev2) => ({ ...prev2, confirmPassword: val === updated.confirmPassword ? '' : 'Passwords do not match' }));
      }
      return updated;
    });
  };

  // ── Submit handler ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = [
      validateField('firstname',       formData.firstname),
      validateField('lastname',        formData.lastname),
      validateField('email',           formData.email),
      validateField('mobile',          formData.mobile),
      validateField('confirmPassword', formData.confirmPassword),
    ].every(Boolean);

    if (!strength.isValid) {
      setErrors((prev) => ({ ...prev, password: 'Must have ≥1 uppercase, ≥1 number, ≥1 special character' }));
    }
    if (!ok || !strength.isValid) { showToast('Please fix all errors.', true); return; }
    if (!formData.terms) { showToast('You must agree to the Terms & Conditions.', true); return; }

    const trimmedEmail = formData.email.trim().toLowerCase();

    // 1. Try backend API signup
    try {
      const user = await apiSignUp(
        formData.firstname.trim(),
        formData.lastname.trim(),
        trimmedEmail,
        formData.mobile.trim(),
        formData.password
      );
      login(user);
      showToast('Registration successful! Welcome to EAZEIT 🎉');
      setTimeout(() => navigate('/profile'), 1200);
      return;
    } catch (error) {
      const message = error.message || 'Registration failed. Please try again.';
      showToast(message, true);
      if (message.toLowerCase().includes('already exists')) {
        setErrors((prev) => ({ ...prev, email: 'This email is already registered. Please login.' }));
      } else if (message.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: message }));
      }
      return;
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 bg-slate-900 border ${errors[field] ? 'border-rose-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 transition-colors`;

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
            <h1 className="font-serif font-bold text-2xl text-white mb-1">Create Account</h1>
            <p className="text-slate-400 text-sm">Join EAZEIT for seamless grocery shopping</p>
          </div>

          {/* Form — all inputs controlled via useState(formData) */}
          <form id="signup-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" htmlFor="signup-firstname" error={errors.firstname}>
                <input type="text" id="signup-firstname" name="firstname" placeholder="First Name" required
                  value={formData.firstname} onChange={handleChange} className={inputClass('firstname')} />
              </FormField>
              <FormField label="Last Name" htmlFor="signup-lastname" error={errors.lastname}>
                <input type="text" id="signup-lastname" name="lastname" placeholder="Last Name" required
                  value={formData.lastname} onChange={handleChange} className={inputClass('lastname')} />
              </FormField>
            </div>

            {/* Email */}
            <FormField label="Email Address" htmlFor="signup-email" error={errors.email}>
              <input type="email" id="signup-email" name="email" placeholder="Enter your email" required
                value={formData.email} onChange={handleChange} className={inputClass('email')} />
            </FormField>

            {/* Mobile */}
            <FormField label="Mobile Number" htmlFor="signup-mobile" error={errors.mobile}>
              <div className="flex gap-2">
                <select className="px-2 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none w-24">
                  <option value="+91">+91 (IN)</option>
                </select>
                <input type="tel" id="signup-mobile" name="mobile" placeholder="Mobile number" required
                  value={formData.mobile} onChange={handleChange}
                  className={`flex-1 px-4 py-3 bg-slate-900 border ${errors.mobile ? 'border-rose-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 transition-colors`} />
              </div>
            </FormField>

            {/* Password — strength evaluated by usePasswordStrength hook */}
            <FormField label="Password" htmlFor="signup-password" error={errors.password}>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="signup-password" name="password"
                  placeholder="Create a password" required value={formData.password} onChange={handleChange}
                  className={`w-full px-4 py-3 pr-11 bg-slate-900 border ${errors.password ? 'border-rose-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 transition-colors`} />
                {/* EyeButton — receives visible and onToggle props */}
                <EyeButton visible={showPassword} onToggle={() => setSP((v) => !v)} id="toggle-signup-password" />
              </div>
              {/* StrengthMeter — receives strength prop from usePasswordStrength hook */}
              <StrengthMeter strength={strength} />
              <span className="text-slate-500 text-[9px] mt-0.5">Criteria: ≥1 uppercase, ≥1 number, ≥1 special symbol.</span>
            </FormField>

            {/* Confirm Password */}
            <FormField label="Confirm Password" htmlFor="signup-confirm-password" error={errors.confirmPassword}>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} id="signup-confirm-password"
                  name="confirmPassword" placeholder="Confirm your password" required
                  value={formData.confirmPassword} onChange={handleChange}
                  className={`w-full px-4 py-3 pr-11 bg-slate-900 border ${errors.confirmPassword ? 'border-rose-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 transition-colors`} />
                <EyeButton visible={showConfirmPassword} onToggle={() => setSCP((v) => !v)} id="toggle-signup-confirm" />
              </div>
            </FormField>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 mt-1">
              <input type="checkbox" id="signup-terms" name="terms" required
                checked={formData.terms} onChange={handleChange} className="mt-1 cursor-pointer accent-teal-400" />
              <label htmlFor="signup-terms" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                I agree to the <Link to="/terms" className="text-teal-400 hover:underline">Terms &amp; Conditions</Link> and <Link to="/privacy" className="text-teal-400 hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button type="submit"
              className="w-full mt-1 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-teal-400/20">
              Create Account
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-col items-center gap-3 text-sm text-slate-400">
            <span>Already have an account? <Link to="/login" className="text-teal-400 hover:underline font-semibold">Login here</Link></span>
            <Link to="/" className="text-slate-300 hover:text-white text-xs">← Back to Home</Link>
          </div>

        </div>
      </main>
    </>
  );
};

export default Signup;