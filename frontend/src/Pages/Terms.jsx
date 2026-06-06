import React from 'react';


const Terms = () => {
  return (
    <>
      

    {/*  ===== NAVBAR =====  */}
    

    {/*  ===== PAGE HEADER =====  */}
    <div className="bg-slate-800 border-b border-slate-700 py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-white mb-3">Terms & <span className="text-teal-400">Conditions</span></h1>
            <p className="text-slate-400 text-sm md:text-base">Last updated: October 24, 2026</p>
        </div>
    </div>

    {/*  ===== CONTENT =====  */}
    <main className="flex-1 py-12 md:py-16 px-4 md:px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-8 md:p-10 shadow-lg">
            
            <div className="prose prose-invert prose-brand max-w-none">
                <p className="text-slate-300 leading-relaxed mb-6">
                    Welcome to EAZEIT. By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
                </p>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">1. General Usage</h2>
                <p className="text-slate-400 leading-relaxed mb-4">
                    EAZEIT provides an online platform for purchasing groceries and daily essentials. You must be at least 18 years old to create an account and make purchases. You are responsible for maintaining the confidentiality of your account credentials.
                </p>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">2. Product Information and Pricing</h2>
                <p className="text-slate-400 leading-relaxed mb-4">
                    We strive to ensure all product images, descriptions, and prices are accurate. However, errors may occur. In the event of a pricing error, we reserve the right to cancel any orders placed for that product. Prices and availability are subject to change without notice.
                </p>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">3. Order Fulfillment and Delivery</h2>
                <ul className="list-disc pl-5 text-slate-400 leading-relaxed mb-6 space-y-2">
                    <li>Orders placed before 2 PM are typically delivered the same day.</li>
                    <li>Delivery times are estimates and may vary based on weather, traffic, and other unforeseen conditions.</li>
                    <li>You must provide a valid and accurate delivery address. Additional charges may apply for failed delivery attempts due to incorrect information.</li>
                </ul>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">4. Returns and Refunds</h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                    If you receive a damaged, expired, or incorrect product, please report it to our customer support within 24 hours of delivery. We will arrange for a replacement or issue a refund as applicable. Certain perishable items may not be eligible for returns.
                </p>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">5. Limitation of Liability</h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                    EAZEIT shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the service or products purchased. We do not warrant that the website will be uninterrupted or error-free at all times.
                </p>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">6. Amendments</h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                    We reserve the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting on the website. Continued use of the service implies your acceptance of the updated terms.
                </p>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">7. Contact Us</h2>
                <p className="text-slate-300 leading-relaxed mb-2">
                    For any questions regarding these terms, please contact:
                </p>
                <p className="text-teal-400 font-medium">legal@eazeit.in</p>
            </div>

        </div>
    </main>

    {/*  ===== FOOTER =====  */}
    


    </>
  );
};
export default Terms;