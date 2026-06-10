import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../Context/ProductContext';
import { resolveProductImage } from '../Utils/image';
import ProductCard from '../Components/ProductCard';

/* ── useScrollReveal: triggers .reveal.visible on elements entering viewport ── */
const useScrollReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

/**
 * Home Page
 * ---------
 * Features:
 *  - Hero section with animated headline
 *  - Features bar (scroll-reveal)
 *  - Category showcase (scroll-reveal)
 *  - Auto-rotating product carousel (3s interval, arrows + dots)
 *  - Why Choose Us section (scroll-reveal)
 */

const CATEGORY_SHOWCASES = [
  { label: 'Oral Care',     catKey: 'Oral Care' },
  { label: 'Household',     catKey: 'Household' },
  { label: 'Bath & Body',   catKey: 'Bath & Body' },
  { label: 'Personal Care', catKey: 'Personal Care' },
];

const CAT_SVG = {
  'Oral Care': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-teal-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3C7.343 3 6 4.343 6 6v6c0 3.314 2.686 6 6 6s6-2.686 6-6V6c0-1.657-1.343-3-3-3H9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6" />
    </svg>
  ),
  'Household': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-teal-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
    </svg>
  ),
  'Bath & Body': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-teal-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a5 5 0 0 1 10 0M5 20h14M12 4v4m-3-2 1.5 2M15 2l-1.5 4" />
    </svg>
  ),
  'Personal Care': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-teal-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zM4 22c0-4.418 3.582-8 8-8s8 3.582 8 8" />
    </svg>
  ),
};

const FEATURES = [
  {
    title: 'Free Delivery',
    sub: 'On orders above Rs. 299',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1m8-1a1 1 0 0 1-1 1H9m4-1V8a1 1 0 0 1 1-1h2.586a1 1 0 0 1 .707.293l3.414 3.414a1 1 0 0 1 .293.707V16a1 1 0 0 1-1 1h-1m-6-1a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
      </svg>
    ),
  },
  {
    title: 'Secure Payments',
    sub: 'UPI, Cards & COD',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1l9 4v6c0 5.25-3.75 10.15-9 11.5C6.75 21.15 3 16.25 3 11V5l9-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Genuine Products',
    sub: '100% authentic',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Easy Returns',
    sub: '7-day hassle-free',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.49 9A9 9 0 0 0 5.64 5.64L4 4m16 16-1.64-1.64A9 9 0 0 1 3.51 15" />
      </svg>
    ),
  },
];

/* ─── Auto-rotating Carousel Component ───────────────────────────────────── */
const ProductCarousel = ({ products }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const total = products.length;
  const visibleCount = total <= 4 ? total : Math.min(3, total);
  const allVisible = visibleCount >= total;

  const goTo = useCallback(
    (index) => {
      if (transitioning || total === 0) return;
      setTransitioning(true);
      setCurrent((index + total) % total);
      setTimeout(() => setTransitioning(false), 400);
    },
    [transitioning, total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance every 3 seconds unless hovered or all products are visible
  useEffect(() => {
    if (isHovered || total <= 1 || allVisible) return;
    timerRef.current = setInterval(next, 3000);
    return () => clearInterval(timerRef.current);
  }, [isHovered, next, total, allVisible]);

  if (total === 0) return null;

  const visibleIndices = Array.from(
    { length: visibleCount },
    (_, offset) => (current + offset) % total
  );

  const colClass =
    visibleCount === 1
      ? 'col-12'
      : visibleCount === 2
        ? 'col-12 col-sm-6'
        : visibleCount === 4
          ? 'col-12 col-sm-6 col-lg-3'
          : 'col-12 col-sm-6 col-lg-4';

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Card Strip ── */}
      <div className="row g-4 overflow-hidden">
        {/* Desktop: show 3 cards */}
        {visibleIndices.map((idx, pos) => (
          <div
            key={products[idx].id}
            className={`${colClass} transition-all duration-400 ${
              transitioning ? 'opacity-60 scale-[0.98]' : 'opacity-100 scale-100'
            }`}
            style={{ transition: 'opacity 0.4s ease, transform 0.4s ease' }}
          >
            <ProductCard product={products[idx]} compact index={pos} />
          </div>
        ))}
      </div>

      {/* ── Prev / Next Arrows ── */}
      {!allVisible && (
        <>
          <button
            onClick={prev}
            aria-label="Previous products"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-700 hover:bg-teal-400 border border-slate-600 hover:border-teal-400 text-slate-300 hover:text-slate-900 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next products"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-700 hover:bg-teal-400 border border-slate-600 hover:border-teal-400 text-slate-300 hover:text-slate-900 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90"
          >
            ›
          </button>
        </>
      )}

      {/* ── Dot Indicators ── */}
      {!allVisible && total > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to product ${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-6 h-2 bg-teal-400'
                  : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Auto-play progress bar ── */}
      {!isHovered && !allVisible && total > 1 && (
        <div className="mt-3 h-0.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            key={current}
            className="h-full bg-teal-400 rounded-full"
            style={{
              animation: 'carousel-progress 3s linear forwards',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes carousel-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

/* ─── Home Page ────────────────────────────────────────────────────────────── */
const Home = () => {
  const { products } = useProducts();

  // Scroll-reveal refs for major sections
  const featuresRef   = useScrollReveal();
  const categoriesRef = useScrollReveal();
  const carouselRef   = useScrollReveal();
  const whyRef        = useScrollReveal();

  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="py-16 md:py-24 bg-slate-900 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container-xl px-4 px-md-6 relative">
          <div className="row align-items-center justify-content-between gy-5">

            {/* Left column */}
            <div className="col-lg-6">
              <div className="inline-flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 text-teal-400 font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-widest mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'13px',height:'13px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1m8-1a1 1 0 0 1-1 1H9m4-1V8a1 1 0 0 1 1-1h2.586a1 1 0 0 1 .707.293l3.414 3.414a1 1 0 0 1 .293.707V16a1 1 0 0 1-1 1h-1m-6-1a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                </svg>
                Now Delivering Near You
              </div>
              <h1 className="font-serif font-extrabold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-5">
                Fresh Groceries,<br />
                Delivered <span className="text-teal-400">Smarter</span>
              </h1>
              <p className="text-slate-400 text-base md:text-lg mb-6 leading-relaxed">
                Shop daily essentials, personal care, and household products from the comfort of your home. Quality guaranteed, delivered fast.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  to="/products"
                  className="btn border-0 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-teal-400/20 active:scale-95"
                >
                  Shop Now →
                </Link>
                <Link
                  to="/about"
                  className="btn bg-transparent text-teal-400 border-2 border-teal-400 hover:bg-teal-400 hover:text-slate-900 font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 active:scale-95"
                >
                  Learn More
                </Link>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-teal-400 font-bold text-xs uppercase tracking-widest">Same Day Delivery</div>
                  <div className="text-slate-400 text-xs mt-1">Order before 2 PM</div>
                </div>
                <div className="border-l border-slate-700 pl-6">
                  <div className="text-teal-400 font-bold text-xs uppercase tracking-widest">Genuine Products</div>
                  <div className="text-slate-400 text-xs mt-1">100% authentic</div>
                </div>
                <div className="border-l border-slate-700 pl-6">
                  <div className="text-teal-400 font-bold text-xs uppercase tracking-widest">Easy Returns</div>
                  <div className="text-slate-400 text-xs mt-1">7-day policy</div>
                </div>
              </div>
            </div>

            {/* Right column — product image mosaic */}
            <div className="col-lg-5">
              <div className="row g-3">
                {products.slice(0, 3).map((p, i) => (
                  <div key={p.id} className={i === 0 ? 'col-12' : 'col-6'}>
                    <div className={`rounded-xl border border-slate-700 bg-slate-800 overflow-hidden ${i === 0 ? 'h-60 md:h-72' : 'h-36 md:h-40'} flex items-center justify-center`}>
                      {p.image ? (
                        <img src={resolveProductImage(p.image)} alt={p.name} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-slate-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-12">
                    <div className="rounded-xl border border-slate-700 bg-slate-800 h-60 flex flex-col items-center justify-center gap-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14 text-slate-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
                      </svg>
                      <p className="text-slate-400 text-sm">Products loading…</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== FEATURES BAR ===== */}
      <div ref={featuresRef} className="reveal bg-slate-800 border-y border-slate-700 py-5">
        <div className="container-xl px-4">
          <div className="flex flex-wrap justify-around items-center gap-6">
            {FEATURES.map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-400/10 border border-teal-400/25 rounded-xl flex items-center justify-center text-teal-400 shrink-0">{icon}</div>
                <div>
                  <div className="text-sm font-bold text-white">{title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CATEGORIES ===== */}
      <section ref={categoriesRef} className="reveal py-16 md:py-20 bg-slate-800">
        <div className="container-xl px-4">
          <h2 className="font-serif font-extrabold text-3xl md:text-4xl text-white text-center mb-2">
            Shop By <span className="text-teal-400">Category</span>
          </h2>
          <p className="text-slate-400 text-sm text-center mb-10">Browse our everyday essentials</p>
          <div className="row g-4">
            {CATEGORY_SHOWCASES.map((cat) => {
              const sample = products.find((p) => p.category === cat.catKey && p.image);
              const count = categoryCounts[cat.catKey] || 0;
              return (
                <div key={cat.catKey} className="col-6 col-lg-3">
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.catKey)}`}
                    className="d-block group text-center bg-slate-900 border border-slate-700 rounded-2xl p-5 transition-all duration-300 hover:border-teal-400 hover:-translate-y-1.5 hover:shadow-xl text-decoration-none"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-teal-400 transition-colors duration-300 flex items-center justify-center bg-slate-800">
                      {sample ? (
                        <img src={resolveProductImage(sample.image)} alt={cat.label} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        CAT_SVG[cat.catKey] || <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-teal-400"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                      )}
                    </div>
                    <div className="text-base font-semibold text-white group-hover:text-teal-400 transition-colors">{cat.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{count} Product{count !== 1 ? 's' : ''}</div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS — AUTO-ROTATING CAROUSEL ===== */}
      <section ref={carouselRef} className="reveal py-16 md:py-20 bg-slate-900">
        <div className="container-xl px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif font-extrabold text-3xl md:text-4xl text-white mb-2">
              Featured <span className="text-teal-400">Products</span>
            </h2>
            <p className="text-slate-400 text-sm">
              {products.length > 4
                ? 'Handpicked essentials — auto-browsing for you'
                : 'Our full catalog — every product in one place'}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center gap-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-slate-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              <h3 className="text-white font-bold text-xl">No Products Available</h3>
              <p className="text-slate-400 text-sm">Please check back later — we are restocking our catalog.</p>
            </div>
          ) : (
            <>
              <div className="px-6 relative">
                <ProductCarousel products={products} />
              </div>
              <div className="text-center mt-10">
                <Link
                  to="/products"
                  className="btn bg-transparent text-teal-400 border-2 border-teal-400 hover:bg-teal-400 hover:text-slate-900 font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 active:scale-95"
                >
                  View All {products.length} Products →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section ref={whyRef} className="reveal py-16 md:py-20 bg-slate-800">
        <div className="container-xl px-4">
          <h2 className="font-serif font-extrabold text-3xl md:text-4xl text-white text-center mb-2">
            Why Choose <span className="text-teal-400">EAZEIT</span>
          </h2>
          <p className="text-slate-400 text-sm text-center mb-10">We make shopping simple, affordable and reliable</p>
          <div className="row g-4">
            {[
              { stat: `${products.length}+`, label: 'Products Available', desc: 'A wide selection across all categories.' },
              { stat: '24hrs',               label: 'Fast Delivery',       desc: 'Same day delivery for orders before 2 PM.' },
              { stat: '100%',                label: 'Quality Guaranteed',  desc: 'Every product is sourced from trusted brands.' },
            ].map(({ stat, label, desc }, i) => (
              <div key={label} className="col-md-4">
                <div
                  className="h-100 bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center hover:border-teal-400/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div className="font-serif font-extrabold text-4xl text-teal-400 mb-3">{stat}</div>
                  <h3 className="font-bold text-white text-lg mb-2">{label}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;