import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from '../Pages/Home';
import Products from '../Pages/Products';
import Login from '../Pages/Login';
import Signup from '../Pages/Signup';
import ForgotPassword from '../Pages/ForgotPassword';
import Profile from '../Pages/Profile';
import Admin from '../Pages/Admin';
import About from '../Pages/About';
import Contact from '../Pages/Contact';
import Faq from '../Pages/Faq';
import Privacy from '../Pages/Privacy';
import Terms from '../Pages/Terms';
import Cart from '../Pages/Cart';
import Checkout from '../Pages/Checkout';
import OrderSuccess from '../Pages/OrderSuccess';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

// Layout wrapper to conditionally render Navbar and Footer (hiding on Admin pages)
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.toLowerCase() === '/admin';

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white font-sans antialiased">
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default AppRouter;

