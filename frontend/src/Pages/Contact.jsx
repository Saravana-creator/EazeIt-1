import React from 'react';
import { Link } from 'react-router-dom';
import { getJSON, setJSON, STORAGE_KEYS } from '../utils/storage';
import { showToast } from '../components/Toast';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      subject: String(formData.get('subject') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      createdAt: new Date().toISOString(),
    };
    const list = getJSON(STORAGE_KEYS.CONTACT_MESSAGES, []) || [];
    list.unshift(payload);
    setJSON(STORAGE_KEYS.CONTACT_MESSAGES, list);
    e.currentTarget.reset();
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
                          <input type="text" id="contact-name" name="name" placeholder="Enter your full name" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label htmlFor="contact-email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                          <input type="email" id="contact-email" name="email" placeholder="Enter your email address" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Phone Number</label>
                          <input type="tel" id="contact-phone" name="phone" placeholder="Enter your mobile number" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label htmlFor="contact-subject" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Subject</label>
                          <input type="text" id="contact-subject" name="subject" placeholder="What is this regarding?" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label htmlFor="contact-message" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Your Message</label>
                          <textarea id="contact-message" name="message" placeholder="Write your message here..." rows="4" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors resize-y"></textarea>
                      </div>
                      <button type="submit" className="w-full mt-2 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-3.5 rounded-lg transition-all duration-200 active:scale-95 shadow-lg shadow-teal-400/20">Send Message</button>
                  </form>
              </div>

          </div>
      </section>
    </>
  );
};
export default Contact;
