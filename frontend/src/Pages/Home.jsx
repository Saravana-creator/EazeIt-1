import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { resolveProductImage } from '../utils/image';
import ProductCard from '../components/ProductCard';

/**
 * Home Page
 * ---------
 * Features:
 *  - Hero section with animated headline
 *  - Features bar
 *  - Category showcase
 *  - Auto-rotating product carousel (3s interval, arrows + dots)
 *  - Why Choose Us section
 */

const CATEGORY_SHOWCASES = [
  { label: 'Oral Care',     catKey: 'Oral Care',     emoji: '🦷' },
  { label: 'Household',     catKey: 'Household',     emoji: '🧹' },
  { label: 'Bath & Body',   catKey: 'Bath & Body',   emoji: '🧼' },
  { label: 'Personal Care', catKey: 'Personal Care', emoji: '💊' },
];

/* ─── Auto-rotating Carousel Component ───────────────────────────────────── */
const ProductCarousel = ({ products }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const total = products.length;

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

  // Auto-advance every 3 seconds unless hovered
  useEffect(() => {
    if (isHovered || total <= 1) return;
    timerRef.current = setInterval(next, 3000);
    return () => clearInterval(timerRef.current);
  }, [isHovered, next, total]);

  if (total === 0) return null;

  // Build visible indices: current, current+1, current+2 (wrapping)
  const visibleIndices = [0, 1, 2].map((offset) => (current + offset) % total);

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
            key={`${idx}-${pos}`}
            className={`col-12 col-sm-6 col-lg-4 transition-all duration-400 ${
              transitioning ? 'opacity-60 scale-[0.98]' : 'opacity-100 scale-100'
            }`}
            style={{ transition: 'opacity 0.4s ease, transform 0.4s ease' }}
          >
            <ProductCard product={products[idx]} compact />
          </div>
        ))}
      </div>

      {/* ── Prev / Next Arrows ── */}
      {total > 3 && (
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
      {total > 1 && (
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
      {!isHovered && total > 1 && (
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
              <div className="inline-block bg-teal-400/10 border border-teal-400/20 text-teal-400 font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-widest mb-5">
                🛒 Now Delivering Near You
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
                        <img src={resolveProductImage(p.image)} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-5xl">{['🦷', '🧹', '🧼', '💊', '📦'][i] || '📦'}</span>
                      )}
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-12">
                    <div className="rounded-xl border border-slate-700 bg-slate-800 h-60 flex flex-col items-center justify-center gap-3">
                      <span className="text-5xl">🛒</span>
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
      <div className="bg-slate-800 border-y border-slate-700 py-5">
        <div className="container-xl px-4">
          <div className="flex flex-wrap justify-around items-center gap-6">
            {[
              { icon: '🚚', title: 'Free Delivery',    sub: 'On orders above Rs. 299' },
              { icon: '🔒', title: 'Secure Payments',  sub: 'UPI, Cards & COD' },
              { icon: '✅', title: 'Genuine Products', sub: '100% authentic' },
              { icon: '🔄', title: 'Easy Returns',     sub: '7-day hassle-free' },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-400/10 border border-teal-400/25 rounded-xl flex items-center justify-center text-2xl shrink-0">{icon}</div>
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
      <section className="py-16 md:py-20 bg-slate-800">
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
                    className="d-block group text-center bg-slate-900 border border-slate-700 rounded-2xl p-5 transition-all duration-300 hover:border-teal-400 hover:-translate-y-1 hover:shadow-xl text-decoration-none"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-teal-400 transition-colors duration-300 flex items-center justify-center bg-slate-800">
                      {sample ? (
                        <img src={resolveProductImage(sample.image)} alt={cat.label} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{cat.emoji}</span>
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
      <section className="py-16 md:py-20 bg-slate-900">
        <div className="container-xl px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif font-extrabold text-3xl md:text-4xl text-white mb-2">
              Featured <span className="text-teal-400">Products</span>
            </h2>
            <p className="text-slate-400 text-sm">Handpicked essentials — auto-browsing for you</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center gap-4">
              <span className="text-6xl">📦</span>
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
      <section className="py-16 md:py-20 bg-slate-800">
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
            ].map(({ stat, label, desc }) => (
              <div key={label} className="col-md-4">
                <div className="h-100 bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center hover:border-teal-400/50 transition-colors duration-300">
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