import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home          from '../Pages/Home';
import Products      from '../Pages/Products';
import Login         from '../Pages/Login';
import Signup        from '../Pages/Signup';
import ForgotPassword from '../Pages/ForgotPassword';
import Profile       from '../Pages/Profile';
import Admin         from '../Pages/Admin';
import About         from '../Pages/About';
import Contact       from '../Pages/Contact';
import Faq           from '../Pages/Faq';
import Privacy       from '../Pages/Privacy';
import Terms         from '../Pages/Terms';
import Cart          from '../Pages/Cart';
import Checkout      from '../Pages/Checkout';
import OrderSuccess  from '../Pages/OrderSuccess';
import Navbar        from '../Components/Navbar';
import Footer        from '../Components/Footer';

// ── Auth helpers (read directly from sessionStorage — no context needed) ──────
function getActiveUser() {
  try {
    const raw = sessionStorage.getItem('eazeit_active_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── ProtectedRoute — redirects to /login if not authenticated ─────────────────
const ProtectedRoute = ({ children }) => {
  const user = getActiveUser();
  const location = useLocation();
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return children;
};

// ── AdminRoute — redirects to / if not admin ──────────────────────────────────
const AdminRoute = ({ children }) => {
  const user = getActiveUser();
  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

// ── AppLayout — wraps pages with Navbar + Footer (hidden on /admin) ───────────
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdmin  = location.pathname.toLowerCase() === '/admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff' }}>
      {!isAdmin && <Navbar />}
      <main style={{ flex: 1 }}>{children}</main>
      {!isAdmin && <Footer />}
    </div>
  );
};

// ── AppRouter ─────────────────────────────────────────────────────────────────
const AppRouter = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/"               element={<Home />} />
          <Route path="/products"       element={<Products />} />
          <Route path="/about"          element={<About />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/faq"            element={<Faq />} />
          <Route path="/privacy"        element={<Privacy />} />
          <Route path="/terms"          element={<Terms />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/signup"         element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart"           element={<Cart />} />

          {/* Protected routes — must be logged in */}
          <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/checkout"       element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

          {/* Admin-only route */}
          <Route path="/admin"          element={<AdminRoute><Admin /></AdminRoute>} />

          {/* Catch-all — redirect to home */}
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default AppRouter;
