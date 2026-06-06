import React from 'react';
import { Link } from 'react-router-dom';
import { colgate, godrejSoap } from '../Assets';

const About = () => {
  return (
    <>
      

    {/*  ===== NAVBAR =====  */}
    

    {/*  ===== HERO =====  */}
    <div className="bg-slate-800 py-5 md:py-20 px-4 md:px-6 text-center border-bottom border-slate-700 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIzIiBmaWxsPSIjMmRkNGJmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L2c+PC9zdmc+')]">
        <div className="container-xl">
            <h1 className="font-serif font-extrabold fs-1 md:fs-display-3 text-white mb-4">About <span className="text-teal-400">EAZEIT</span></h1>
            <p className="text-slate-300 fs-5 leading-relaxed max-w-2xl mx-auto m-0">We are on a mission to make grocery shopping smarter, faster, and more affordable for every household in India.</p>
        </div>
    </div>

    {/*  ===== ABOUT CONTENT =====  */}
    <section className="py-5 md:py-20 bg-slate-900">
        <div className="container-xl">
            
            <div className="row align-items-center gy-5 mb-5">
                <div className="col-lg-6 pe-lg-5">
                    <h2 className="font-serif font-extrabold fs-2 text-white mb-4">Who <span className="text-teal-400">We Are</span></h2>
                    <p className="text-slate-400 fs-6 leading-relaxed mb-3">EAZEIT is an online grocery and daily essentials platform built for the modern Indian household. We believe that accessing quality products should never be a hassle — it should be easy, fast, and reliable.</p>
                    <p className="text-slate-400 fs-6 leading-relaxed mb-3">We started with a simple idea: bring the local kirana store experience online, while maintaining the trust and familiarity that customers have always loved. Every product on our platform is carefully sourced, quality-checked, and priced fairly.</p>
                    <p className="text-slate-400 fs-6 leading-relaxed mb-4">From personal care products to household cleaners and food staples, EAZEIT is your one-stop shop for everything you need at home.</p>
                    <Link to="/products" className="btn bg-teal-400 hover:bg-teal-500 text-slate-900 fw-bold px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 shadow-lg shadow-teal-400/10 border-0">Browse Products</Link>
                </div>
                <div className="col-lg-6">
                    <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden h-100 min-h-[300px] md:min-h-[400px] d-flex align-items-center justify-content-center p-3 p-md-4">
                        <img src={colgate} alt="EAZEIT product range" className="w-100 h-100 object-cover rounded-lg shadow-2xl" />
                    </div>
                </div>
            </div>

            <div className="row align-items-center gy-5 mt-3">
                <div className="col-lg-6 order-2 order-lg-1">
                    <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden h-100 min-h-[300px] md:min-h-[400px] d-flex align-items-center justify-content-center p-3 p-md-4">
                        <img src={godrejSoap} alt="Quality products at EAZEIT" className="w-100 h-100 object-cover rounded-lg shadow-2xl" />
                    </div>
                </div>
                <div className="col-lg-6 order-1 order-lg-2 ps-lg-5">
                    <h2 className="font-serif font-extrabold fs-2 text-white mb-4">Our <span className="text-teal-400">Mission</span></h2>
                    <p className="text-slate-400 fs-6 leading-relaxed mb-3">Our mission is to connect every Indian household with genuine, affordable daily essentials through a platform that is simple to use, trustworthy, and fast.</p>
                    <p className="text-slate-400 fs-6 leading-relaxed mb-5">We aim to serve customers across cities and towns, making grocery shopping a seamless experience — whether you are ordering on a phone or a desktop.</p>
                    
                    <h2 className="font-serif font-extrabold fs-2 text-white mb-4">Our <span className="text-teal-400">Vision</span></h2>
                    <p className="text-slate-400 fs-6 leading-relaxed m-0">To become India's most trusted grocery delivery platform, known for quality, speed, and customer satisfaction. We envision a future where no household ever runs out of its daily essentials.</p>
                </div>
            </div>

        </div>
    </section>

    {/*  ===== WHY CHOOSE US =====  */}
    <section className="py-5 md:py-20 bg-slate-800 border-y border-slate-700">
        <div className="container-xl">
            <h2 className="font-serif font-extrabold fs-2 fs-md-1 text-white text-center mb-2">Why Choose <span className="text-teal-400">EAZEIT</span></h2>
            <p className="text-slate-400 fs-6 text-center mb-5">We deliver more than just products</p>
            
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card h-100 bg-slate-800 border border-slate-700 rounded-xl p-4 p-md-5 text-center transition-all duration-300 hover:border-teal-400/50">
                        <div className="fs-1 font-serif font-extrabold text-teal-400 mb-3">500+</div>
                        <h3 className="fs-5 fw-bold text-white mb-2">Products Listed</h3>
                        <p className="card-text text-sm text-slate-400 leading-relaxed">A growing catalog of grocery, personal care, and household products from trusted Indian and international brands.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 bg-slate-800 border border-slate-700 rounded-xl p-4 p-md-5 text-center transition-all duration-300 hover:border-teal-400/50">
                        <div className="fs-1 font-serif font-extrabold text-teal-400 mb-3">24hr</div>
                        <h3 className="fs-5 fw-bold text-white mb-2">Delivery Guarantee</h3>
                        <p className="card-text text-sm text-slate-400 leading-relaxed">Orders placed before 2 PM are delivered the same day. All other orders are delivered within 24 hours.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 bg-slate-800 border border-slate-700 rounded-xl p-4 p-md-5 text-center transition-all duration-300 hover:border-teal-400/50">
                        <div className="fs-1 font-serif font-extrabold text-teal-400 mb-3">100%</div>
                        <h3 className="fs-5 fw-bold text-white mb-2">Genuine Products</h3>
                        <p className="card-text text-sm text-slate-400 leading-relaxed">Every product listed on EAZEIT is sourced from verified distributors and checked for authenticity before listing.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/*  ===== TEAM =====  */}
    <section className="py-5 md:py-20 bg-slate-900">
        <div className="container-xl">
            <h2 className="font-serif font-extrabold fs-2 fs-md-1 text-white text-center mb-2">Meet Our <span className="text-teal-400">Team</span></h2>
            <p className="text-slate-400 fs-6 text-center mb-5">The people behind EAZEIT</p>

            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card h-100 bg-slate-800 border border-slate-700 rounded-xl p-4 p-md-5 text-center transition-all duration-300 hover:border-teal-400/30 group shadow-lg">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-400 to-teal-500 rounded-circle d-flex align-items-center justify-content-center font-serif font-extrabold fs-1 text-slate-900 mb-4 shadow-lg shadow-teal-400/20 group-hover:scale-105 transition-transform">S</div>
                        <h3 className="fs-5 fw-bold text-white mb-1">Saravana Perumal</h3>
                        <div className="text-xs text-teal-400 fw-bold text-uppercase tracking-wider mb-3">Founder &amp; Creator</div>
                        <p className="card-text text-sm text-slate-400 leading-relaxed">Saravana built and designed the EAZEIT platform from the ground up, focusing on bringing a modern, fast, and highly reliable e-commerce experience to everyday grocery shopping.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/*  ===== FOOTER =====  */}
    


    </>
  );
};
export default About;