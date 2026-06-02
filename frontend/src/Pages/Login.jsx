import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { showToast } from '../components/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = useMemo(() => searchParams.get('redirect') || '/', [searchParams]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const ADMIN_EMAIL = 'admin@eazeit.in';
    const ADMIN_PASSWORD = 'Admin@123';

    // 1. Admin Verification
    if (trimmedEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      if (password === ADMIN_PASSWORD) {
        const adminUser = {
          firstName: 'Admin',
          lastName: 'EAZEIT',
          email: ADMIN_EMAIL,
          role: 'admin'
        };
        localStorage.setItem('eazeit_active_user', JSON.stringify(adminUser));
        showToast('Admin login successful! Redirecting to Admin Panel...');
        setTimeout(() => {
          navigate('/admin');
        }, 1200);
      } else {
        showToast('Incorrect admin password. Please try again.', true);
        setPassword('');
      }
      return;
    }

    // 2. Regular User Verification
    const usersDatabase = JSON.parse(localStorage.getItem('eazeit_users')) || [];
    const matchedUser = usersDatabase.find(
      (user) => user.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (matchedUser && matchedUser.password === password) {
      localStorage.setItem('eazeit_active_user', JSON.stringify(matchedUser));
      showToast(`Login successful! Welcome back, ${matchedUser.firstName}.`);
      setTimeout(() => {
        navigate(redirectTo);
      }, 1200);
    } else {
      showToast('Invalid Email Address or Password. Please try again.', true);
      setPassword('');
    }
  };

  return (
    <>
      {/*  ===== LOGIN FORM =====  */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-900 min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 md:p-10 shadow-lg shadow-slate-900/50">
            
            <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center font-serif font-extrabold text-2xl text-slate-900 shadow-md shadow-teal-400/20 mb-4">E</div>
                <h1 className="font-serif font-bold text-2xl text-white mb-1">Welcome Back</h1>
                <p className="text-slate-400 text-sm">Login to your EAZEIT account</p>
            </div>

            <form id="login-form" onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      id="login-email" 
                      name="email" 
                      placeholder="Enter your email address" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors" 
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                    <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          id="login-password" 
                          name="password" 
                          placeholder="Enter your password" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-10 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors" 
                        />
                        <button 
                          type="button" 
                          id="toggle-login-password" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-teal-400 transition-colors"
                        >
                          {showPassword ? (
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
                    </div>
                </div>

                <div className="text-right">
                    <Link to="/forgot-password" className="text-xs font-medium text-teal-400 hover:underline">Forgot your password?</Link>
                </div>

                <button type="submit" className="w-full mt-2 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-3.5 rounded-lg transition-all duration-200 active:scale-95 shadow-lg shadow-teal-400/20">Login to Account</button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-col items-center gap-3 text-sm text-slate-400">
                <span>Do not have an account? <Link to="/signup" className="text-teal-400 hover:underline font-semibold">Create one here</Link></span>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">Back to Home</Link>
            </div>

        </div>
      </main>
    </>
  );
};

export default Login;
