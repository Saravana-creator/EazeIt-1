import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../Context/ProductContext';
import ProductCard from '../Components/ProductCard';

const CATEGORIES = ['All Products', 'Oral Care', 'Household', 'Bath & Body', 'Food & Snacks', 'Personal Care', 'Beverages', 'Dairy', 'Others'];

const CAT_EMOJI = {
  'All Products': '🛍️', 'Oral Care': '🦷', 'Household': '🧹', 'Bath & Body': '🧼',
  'Food & Snacks': '🍎', 'Personal Care': '💊', 'Beverages': '☕',
  'Dairy': '🥛', 'Others': '📦',
};

const Products = () => {
  // ── Context / Router hooks ────────────────────────────────────────────────
  const { products } = useProducts();
  const [searchParams] = useSearchParams();

  // ── Filter & Search State ─────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activePriceRange, setActivePriceRange] = useState({ min: '', max: '' });

  // ── Sync URL params on mount ──────────────────────────────────────────────
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) setSearchQuery(searchFromUrl);

    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && CATEGORIES.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // ── Derived: dynamic category counts ─────────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // ── Derived: dynamic brand counts ────────────────────────────────────────
  const brandCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const b = p.brand || 'Others';
      counts[b] = (counts[b] || 0) + 1;
    });
    return counts;
  }, [products]);

  const allBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand || 'Others'));
    return ['All Brands', ...Array.from(brands)];
  }, [products]);

  // ── Filtered + Sorted products ────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All Products') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedBrand !== 'All Brands') {
      result = result.filter((p) => (p.brand || 'Others') === selectedBrand);
    }

    if (activePriceRange.min !== '') {
      result = result.filter((p) => p.price >= Number(activePriceRange.min));
    }
    if (activePriceRange.max !== '') {
      result = result.filter((p) => p.price <= Number(activePriceRange.max));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest')
      result.sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));

    return result;
  }, [products, selectedCategory, selectedBrand, activePriceRange, searchQuery, sortBy]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const applyPriceFilter = () => {
    setActivePriceRange({ min: minPrice, max: maxPrice });
  };

  const clearPriceFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setActivePriceRange({ min: '', max: '' });
  };

  const clearAllFilters = () => {
    setSelectedCategory('All Products');
    setSelectedBrand('All Brands');
    setSearchQuery('');
    clearPriceFilter();
  };

  return (
    <>
      {/*  ===== PAGE HEADER =====  */}
      <div className="bg-slate-800 border-b border-slate-700 py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-white mb-2">
              All <span className="text-teal-400">Products</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Browse our complete range of groceries, personal care and household essentials
            </p>
          </div>
          <div className="flex gap-2 items-center text-xs text-slate-400">
            <Link to="/" className="text-teal-400 hover:underline">Home</Link>
            <span>/</span>
            <span className="text-slate-300">Products</span>
          </div>
        </div>
      </div>

      {/*  ===== PRODUCTS LAYOUT =====  */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

          {/*  Sidebar  */}
          <aside className="w-full lg:w-64 shrink-0 bg-slate-800 border border-slate-700 rounded-xl p-6 h-fit">

            {/* Mobile Search */}
            <div className="relative mb-6 lg:hidden">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">&#9906;</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors"
              />
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-3 border-b border-slate-700">Categories</h3>
              <div className="flex flex-col gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex justify-between items-center text-sm px-3 py-2 rounded-lg transition-colors text-left ${selectedCategory === cat ? 'bg-teal-400/10 text-teal-400' : 'text-slate-300 hover:bg-teal-400/5 hover:text-teal-400'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{CAT_EMOJI[cat] || '📦'}</span>
                      <span>{cat}</span>
                    </span>
                    <span className={`text-xs ${selectedCategory === cat ? 'text-teal-400' : 'text-slate-400'}`}>
                      {cat === 'All Products' ? products.length : (categoryCounts[cat] || 0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-3 border-b border-slate-700">Price Range</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="number"
                  placeholder="Min (Rs.)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400"
                />
                <input
                  type="number"
                  placeholder="Max (Rs.)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={applyPriceFilter}
                    className="flex-1 bg-transparent hover:bg-teal-400 text-teal-400 hover:text-slate-900 border border-teal-400 font-bold text-sm py-2 rounded-lg transition-all duration-200"
                  >Apply</button>
                  {(activePriceRange.min || activePriceRange.max) && (
                    <button
                      onClick={clearPriceFilter}
                      className="flex-1 bg-transparent hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 font-bold text-sm py-2 rounded-lg transition-all duration-200"
                    >Clear</button>
                  )}
                </div>
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-3 border-b border-slate-700">Brands</h3>
              <div className="flex flex-col gap-1.5">
                {allBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`flex justify-between items-center text-sm px-3 py-1.5 rounded-lg transition-colors text-left ${selectedBrand === brand ? 'bg-teal-400/10 text-teal-400' : 'text-slate-300 hover:bg-teal-400/5 hover:text-teal-400'}`}
                  >
                    <span>{brand}</span>
                    <span className={`text-xs ${selectedBrand === brand ? 'text-teal-400' : 'text-slate-400'}`}>
                      {brand === 'All Brands' ? products.length : (brandCounts[brand] || 0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/*  Main Content  */}
          <div className="flex-1">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 flex-1">
                {/* Desktop Search */}
                <div className="hidden lg:flex relative flex-1 max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">&#9906;</span>
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
                <div className="text-sm text-slate-300">
                  Showing <strong className="text-white">{filteredProducts.length}</strong> products
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-teal-400 w-full sm:w-auto"
              >
                <option value="default">Sort by: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Active filter chips */}
            {(selectedCategory !== 'All Products' || selectedBrand !== 'All Brands' || activePriceRange.min || activePriceRange.max || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCategory !== 'All Products' && (
                  <span className="flex items-center gap-1.5 bg-teal-400/10 text-teal-400 border border-teal-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('All Products')} className="hover:text-white leading-none">&times;</button>
                  </span>
                )}
                {selectedBrand !== 'All Brands' && (
                  <span className="flex items-center gap-1.5 bg-teal-400/10 text-teal-400 border border-teal-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                    {selectedBrand}
                    <button onClick={() => setSelectedBrand('All Brands')} className="hover:text-white leading-none">&times;</button>
                  </span>
                )}
                {(activePriceRange.min || activePriceRange.max) && (
                  <span className="flex items-center gap-1.5 bg-teal-400/10 text-teal-400 border border-teal-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                    Rs. {activePriceRange.min || '0'} – {activePriceRange.max || '∞'}
                    <button onClick={clearPriceFilter} className="hover:text-white leading-none">&times;</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="flex items-center gap-1.5 bg-teal-400/10 text-teal-400 border border-teal-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-white leading-none">&times;</button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid – uses reusable ProductCard component with product prop */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-4 text-center">
                <div className="text-5xl">&#128269;</div>
                <h3 className="text-lg font-bold text-white">No products found</h3>
                <p className="text-slate-400 text-sm">Try a different keyword or browse all products.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-2 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold text-sm px-6 py-2 rounded-lg transition-all active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  /* Each ProductCard receives a product prop */
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </>
  );
};

export default Products;
