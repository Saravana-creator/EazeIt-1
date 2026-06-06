import React from 'react';


const Privacy = () => {
  return (
    <>
      

    {/*  ===== NAVBAR =====  */}
    

    {/*  ===== PAGE HEADER =====  */}
    <div className="bg-slate-800 border-b border-slate-700 py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-white mb-3">Privacy <span className="text-teal-400">Policy</span></h1>
            <p className="text-slate-400 text-sm md:text-base">Last updated: October 24, 2026</p>
        </div>
    </div>

    {/*  ===== CONTENT =====  */}
    <main className="flex-1 py-12 md:py-16 px-4 md:px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-8 md:p-10 shadow-lg">
            
            <div className="prose prose-invert prose-brand max-w-none">
                <p className="text-slate-300 leading-relaxed mb-6">
                    At EAZEIT, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard the information you provide when using our website and services.
                </p>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">1. Information We Collect</h2>
                <p className="text-slate-400 leading-relaxed mb-4">We may collect the following types of information when you interact with EAZEIT:</p>
                <ul className="list-disc pl-5 text-slate-400 leading-relaxed mb-6 space-y-2">
                    <li><strong>Personal Information:</strong> Name, email address, phone number, and delivery address when you create an account or place an order.</li>
                    <li><strong>Payment Information:</strong> Credit card details, UPI IDs, or other payment details required to process your orders. Note: We use secure third-party payment gateways and do not store full payment credentials on our servers.</li>
                    <li><strong>Usage Data:</strong> Information about your browsing behavior, IP address, device type, and interactions with our website to improve user experience.</li>
                </ul>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">2. How We Use Your Information</h2>
                <p className="text-slate-400 leading-relaxed mb-4">The information we collect is used to:</p>
                <ul className="list-disc pl-5 text-slate-400 leading-relaxed mb-6 space-y-2">
                    <li>Process and deliver your grocery orders accurately.</li>
                    <li>Communicate with you regarding order updates, offers, and support.</li>
                    <li>Improve our website, product offerings, and customer service.</li>
                    <li>Prevent fraudulent activities and ensure the security of our platform.</li>
                </ul>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">3. Data Sharing and Disclosure</h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                    We do not sell, trade, or rent your personal information to third parties. We may share necessary data with trusted delivery partners and payment processors solely for the purpose of fulfilling your orders. We may also disclose information if required by law or to protect our rights and safety.
                </p>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">4. Cookies</h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                    EAZEIT uses cookies to enhance your browsing experience. Cookies help us remember your preferences, keep you logged in, and analyze site traffic. You can modify your browser settings to decline cookies, but this may affect certain functionalities of the website.
                </p>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">5. Data Security</h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                    We implement industry-standard security measures to protect your personal data from unauthorized access, alteration, or disclosure. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.
                </p>

                <h2 className="font-serif font-bold text-xl text-white mt-10 mb-4">6. Contact Us</h2>
                <p className="text-slate-300 leading-relaxed mb-2">
                    If you have any questions or concerns about this Privacy Policy, please contact us at:
                </p>
                <p className="text-teal-400 font-medium">privacy@eazeit.in</p>
            </div>

        </div>
    </main>

    {/*  ===== FOOTER =====  */}
    


    </>
  );
};
export default Privacy;