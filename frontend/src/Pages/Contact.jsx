import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Hooks';
import { apiSendFeedback } from '../Utils/api';
import { getJSON, setJSON, STORAGE_KEYS } from '../Utils/storage';
import { showToast } from '../Components/Toast';

/*
 * Contact Page Component
 * ----------------------
 * Displays contact information and a form to send messages.
 * 
 * Hooks used:
 *   - useState: to manage form inputs
 *   - useEffect: to prefill signed-in user information
 * 
 * Props: None
 */
const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      showToast('Please provide your name, email, and message.', true);
      return;
    }

    setSending(true);
    const emailServiceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'sara24052007';
    const emailTemplateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_l8lwjue';
    const emailUserId = process.env.REACT_APP_EMAILJS_USER_ID || '';

    const emailjsPayload = {
      service_id: emailServiceId,
      template_id: emailTemplateId,
      user_id: emailUserId,
      template_params: {
        user_name: payload.name,
        user_email: payload.email,
        user_phone: payload.phone,
        user_subject: payload.subject,
        user_message: payload.message,
      },
    };

    let backendSaved = false;
    try {
      await apiSendFeedback(payload);
      backendSaved = true;
    } catch (error) {
      console.warn('Feedback API failed:', error.message);
      const list = getJSON(STORAGE_KEYS.CONTACT_MESSAGES, []) || [];
      list.unshift({ ...payload, createdAt: new Date().toISOString() });
      setJSON(STORAGE_KEYS.CONTACT_MESSAGES, list);
      showToast('Feedback saved locally because the server is unavailable.', true);
    }

    try {
      if (!emailUserId) {
        throw new Error('EmailJS public key is not configured. Set REACT_APP_EMAILJS_USER_ID in frontend environment.');
      }
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailjsPayload),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`EmailJS error: ${errorBody}`);
      }
    } catch (error) {
      console.warn('EmailJS send failed:', error.message);
      if (backendSaved) {
        showToast('Your message is saved and will be emailed once EmailJS is configured.', true);
      } else {
        showToast('Unable to send the message right now. Please try again later.', true);
      }
      setSending(false);
      return;
    }

    setFormData({ name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '', email: user?.email || '', phone: '', subject: '', message: '' });
    setSending(false);
    showToast('Message sent successfully. We will get back to you soon.');
  };

  return (
    <>
      {/*  ===== PAGE HEADER =====  */}
      <div className="bg-slate-800 border-b border-slate-700 py-12 md:py-16 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-white mb-3">Contact <span className="text-teal-400">Us</span></h1>
              <p className="text-slate-400 text-sm md:text-base">We are here to help. Reach out to us for any queries, feedback or support.</p>
              <div className="flex gap-2 items-center justify-center text-xs text-slate-400 mt-4">
                  <Link to="/" className="text-teal-400 hover:underline">Home</Link>
                  <span>/</span>
                  <span className="text-slate-300">Contact Us</span>
              </div>
          </div>
      </div>

      {/*  ===== CONTACT CONTENT =====  */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-slate-900 flex-1">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-base font-bold text-white mb-3">Our Address</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                          12, Market Street, Anna Nagar,<br />
                          Chennai, Tamil Nadu - 600001<br />
                          India
                      </p>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-base font-bold text-white mb-3">Email Support</h3>
                      <p className="text-sm text-slate-400 mb-2">General Enquiries:<br /><a href="mailto:info@eazeit.in" className="text-teal-400 hover:underline">info@eazeit.in</a></p>
                      <p className="text-sm text-slate-400">Customer Support:<br /><a href="mailto:support@eazeit.in" className="text-teal-400 hover:underline">support@eazeit.in</a></p>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 md:col-span-2">
                      <h3 className="text-base font-bold text-white mb-3">Phone Numbers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <p className="text-sm text-slate-400">Customer Care:<br /><a href="tel:+919876543210" className="text-teal-400 hover:underline">+91 98765 43210</a></p>
                          <p className="text-sm text-slate-400">Order Support:<br /><a href="tel:+919876543211" className="text-teal-400 hover:underline">+91 98765 43211</a></p>
                      </div>
                      <p className="text-xs text-slate-300 mt-4 border-t border-slate-700/60 pt-4">Available Monday to Saturday, 9 AM to 7 PM</p>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                          <h3 className="text-base font-bold text-white mb-1">Follow Us</h3>
                          <p className="text-sm text-slate-400">Stay connected with EAZEIT on social media.</p>
                      </div>
                      <div className="flex gap-4">
                          <a href="#!" className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-teal-400 hover:bg-teal-400 hover:text-slate-900 transition-colors font-bold text-sm">Fb</a>
                          <a href="#!" className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-teal-400 hover:bg-teal-400 hover:text-slate-900 transition-colors font-bold text-sm">Ig</a>
                          <a href="#!" className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-teal-400 hover:bg-teal-400 hover:text-slate-900 transition-colors font-bold text-sm">Tw</a>
                      </div>
                  </div>
              </div>

              <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-8 md:p-10 shadow-lg shadow-slate-900">
                  <h2 className="font-serif font-bold text-2xl text-white mb-8">Send Us a <span className="text-teal-400">Message</span></h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                          <label htmlFor="contact-name" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
                          <input 
                            type="text" 
                            id="contact-name" 
                            name="name" 
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name" 
                            required 
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors" 
                          />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label htmlFor="contact-email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                          <input 
                            type="email" 
                            id="contact-email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address" 
                            required 
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors" 
                          />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Phone Number</label>
                          <input 
                            type="tel" 
                            id="contact-phone" 
                            name="phone" 
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your mobile number" 
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors" 
                          />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label htmlFor="contact-subject" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Subject</label>
                          <input 
                            type="text" 
                            id="contact-subject" 
                            name="subject" 
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="What is this regarding?" 
                            required 
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors" 
                          />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label htmlFor="contact-message" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Your Message</label>
                          <textarea 
                            id="contact-message" 
                            name="message" 
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Write your message here..." 
                            rows="4" 
                            required 
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors resize-y"
                          ></textarea>
                      </div>
                      <button type="submit" disabled={sending} className="w-full mt-2 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-3.5 rounded-lg transition-all duration-200 active:scale-95 shadow-lg shadow-teal-400/20">
                        {sending ? 'Sending...' : 'Send Message'}
                      </button>
                  </form>
              </div>

          </div>
      </section>
    </>
  );
};

export default Contact;
