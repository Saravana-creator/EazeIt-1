import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/*
 * FAQ Page Component
 * ------------------
 * Displays frequently asked questions in accordion format.
 * 
 * Hooks used:
 *   - useState: to track which FAQ item is currently open
 * 
 * Each FAQ item can be toggled open/closed by clicking on it.
 */
const Faq = () => {
  // State to track the currently open FAQ (stores the id of the open FAQ, or null if none is open)
  const [openFaq, setOpenFaq] = useState(null);

  // Toggle function: if clicked FAQ is already open, close it; otherwise open it
  const toggleFaq = (id) => {
    setOpenFaq(prev => prev === id ? null : id);
  };

  return (
    <>
      {/*  ===== PAGE HEADER =====  */}
      <div className="bg-slate-800 border-b border-slate-700 py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-white mb-3">Frequently Asked <span className="text-teal-400">Questions</span></h1>
            <p className="text-slate-400 text-sm md:text-base">Find quick answers to the most common questions about shopping on EAZEIT</p>
            <div className="flex gap-2 items-center justify-center text-xs text-slate-400 mt-4">
                <Link to="/" className="text-teal-400 hover:underline">Home</Link>
                <span>/</span>
                <span className="text-slate-300">FAQ</span>
            </div>
        </div>
      </div>

      {/*  ===== FAQ ACCORDIONS =====  */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto">
            
            {/*  Category: Orders & Delivery  */}
            <div className="mb-12">
                <h2 className="font-serif font-bold text-xl md:text-2xl text-white mb-2">Orders &amp; <span className="text-teal-400">Delivery</span></h2>
                <p className="text-xs text-slate-400 mb-6">Questions about placing orders and receiving them</p>

                <div className="space-y-4">
                    {/* FAQ 1 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-1')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            How do I place an order on EAZEIT?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-1' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-1' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                Simply browse our products page, add the items you want to your cart, and proceed to checkout. You will need to create an account or log in before placing your first order. Once your order is confirmed, you will receive an email with your order details.
                            </p>
                        </div>
                    </div>

                    {/* FAQ 2 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-2')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            How long does delivery take?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-2' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-2' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                Orders placed before 2 PM on working days are delivered the same day. All other orders are delivered within 24 to 48 hours. Delivery timelines may vary during public holidays or extreme weather conditions.
                            </p>
                        </div>
                    </div>

                    {/* FAQ 3 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-3')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            Is there a minimum order value for delivery?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-3' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-3' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                There is no minimum order value to place an order on EAZEIT. However, free delivery is available on orders above Rs. 299. A small delivery fee applies to orders below this amount.
                            </p>
                        </div>
                    </div>

                    {/* FAQ 4 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-4')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            Can I track my order after placing it?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-4' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-4' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                Yes. Once your order is dispatched, you will receive an SMS and email with a tracking link. You can also log in to your EAZEIT account and view the status of your order from the My Orders section.
                            </p>
                        </div>
                    </div>

                    {/* FAQ 5 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-5')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            Can I cancel or modify my order after placing it?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-5' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-5' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                Orders can be cancelled within 30 minutes of being placed, provided they have not yet been dispatched. Once dispatched, cancellation is not possible. You can contact our support team immediately at support@eazeit.in to request a cancellation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/*  Category: Payments & Billing  */}
            <div className="mb-12">
                <h2 className="font-serif font-bold text-xl md:text-2xl text-white mb-2">Payments &amp; <span className="text-teal-400">Billing</span></h2>
                <p className="text-xs text-slate-400 mb-6">Questions about payment methods and billing</p>

                <div className="space-y-4">
                    {/* FAQ 6 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-6')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            What payment methods does EAZEIT accept?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-6' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-6' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                EAZEIT accepts a wide range of payment options including UPI (GPay, PhonePe, Paytm), credit cards, debit cards, net banking, and Cash on Delivery for eligible orders. All online transactions are encrypted and secure.
                            </p>
                        </div>
                    </div>

                    {/* FAQ 7 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-7')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            Is it safe to enter my card details on EAZEIT?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-7' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-7' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                Yes, absolutely. All payment transactions on EAZEIT are processed through PCI-DSS compliant payment gateways. We do not store your card details on our servers. Your transactions are protected with bank-level encryption.
                            </p>
                        </div>
                    </div>

                    {/* FAQ 8 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-8')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            Will I receive an invoice for my order?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-8' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-8' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                Yes. A digital invoice is sent to your registered email address after every successful order. You can also download your invoice from the My Orders section in your account at any time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/*  Category: Returns & Refunds  */}
            <div className="mb-12">
                <h2 className="font-serif font-bold text-xl md:text-2xl text-white mb-2">Returns &amp; <span className="text-teal-400">Refunds</span></h2>
                <p className="text-xs text-slate-400 mb-6">Questions about our return and refund process</p>

                <div className="space-y-4">
                    {/* FAQ 9 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-9')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            How do I return a product?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-9' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-9' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                To return a product, contact our support team at returns@eazeit.in within 7 days of receiving your order. Mention your order ID and the reason for return. Our team will schedule a pickup from your address at no extra charge.
                            </p>
                        </div>
                    </div>

                    {/* FAQ 10 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-10')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            How long does a refund take to process?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-10' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-10' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                Once your returned product is received and verified, the refund is initiated within 2 working days. The amount will reflect in your original payment method within 5 to 7 working days depending on your bank.
                            </p>
                        </div>
                    </div>

                    {/* FAQ 11 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-11')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            Can I return a food or perishable item?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-11' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-11' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                Perishable food items are generally not eligible for returns. However, if you receive a damaged, expired, or incorrect food item, please take a photograph and contact us immediately at support@eazeit.in. We will resolve it on priority.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/*  Category: Account & Profile  */}
            <div className="mb-12">
                <h2 className="font-serif font-bold text-xl md:text-2xl text-white mb-2">Account &amp; <span className="text-teal-400">Profile</span></h2>
                <p className="text-xs text-slate-400 mb-6">Questions about managing your EAZEIT account</p>

                <div className="space-y-4">
                    {/* FAQ 12 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-12')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            How do I reset my password?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-12' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-12' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                Visit the Forgot Password page and enter your registered email address. We will send a password reset link to your inbox. Click the link and follow the steps to set a new password. The link is valid for 30 minutes.
                            </p>
                        </div>
                    </div>

                    {/* FAQ 13 */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleFaq('faq-13')} 
                          className="cursor-pointer w-full flex justify-between items-center py-4 px-6 bg-slate-800 hover:bg-slate-700 text-sm md:text-base font-semibold text-white transition-colors duration-200 select-none text-left"
                        >
                            How do I delete my EAZEIT account?
                            <span className={`text-teal-400 text-xl font-bold transition-transform duration-300 ${openFaq === 'faq-13' ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        <div className={`transition-all duration-300 bg-slate-900/40 px-6 overflow-hidden ${openFaq === 'faq-13' ? 'max-h-60 py-4 border-t border-slate-700' : 'max-h-0'}`}>
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                To delete your account, send an email to support@eazeit.in from your registered email address with the subject line "Account Deletion Request". Our team will process the request within 7 working days and notify you once completed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/*  CTA block  */}
            <div className="mt-16 p-8 bg-slate-800 border border-slate-700 rounded-xl text-center">
                <h3 className="text-lg font-bold text-white mb-2">Still have a question?</h3>
                <p className="text-slate-400 text-xs md:text-sm mb-6">Our support team is ready to help you from Monday to Saturday, 9 AM to 7 PM.</p>
                <Link to="/contact" className="inline-block bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-2.5 rounded-lg transition-all duration-200 active:scale-95">Contact Support</Link>
            </div>
        </div>
      </section>
    </>
  );
};

export default Faq;
