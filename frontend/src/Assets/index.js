/**
 * src/assets/index.js
 * -------------------
 * Central barrel export for all product and UI images.
 * Import from this file anywhere in the project:
 *
 *   import { colgate, harpic, godrejSoap, goodknight, closeup, margoSoap, laysChilli, garamMasala, wheatFlour } from '../Assets';
 *
 * All images are compressed JPEGs (4–8 KB each) for fast loading.
 */

import colgate     from './colgate.jpg';
import harpic      from './harpic.jpg';
import godrejSoap  from './godrejSoap.jpg';
import goodknight  from './goodknight.jpg';
import closeup     from './closeup.jpg';
import margoSoap   from './margoSoap.jpg';
import laysChilli  from './laysChilli.jpg';
import garamMasala from './garamMasala.jpg';
import wheatFlour  from './wheatFlour.jpg';
import muiLogo     from './material-ui-logo.svg';

export { colgate, harpic, godrejSoap, goodknight, closeup, margoSoap, laysChilli, garamMasala, wheatFlour, muiLogo };

/**
 * SEED_PRODUCTS — the initial products populated on first load.
 * These use compressed JPEGs (~5 KB each) for fast performance.
 * The Admin panel can edit or delete any of these products.
 * No product is ever hardcoded in the UI — everything comes from ProductContext.
 */
export const SEED_PRODUCTS = [
  {
    id: 'seed-1',
    name: 'Colgate Strong Teeth Toothpaste',
    category: 'Oral Care',
    brand: 'Colgate',
    price: 45,
    mrp: 50,
    unit: '200g + 160g Pack',
    badge: 'Best Seller',
    image: colgate,
    addedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-2',
    name: 'Harpic Toilet Cleaner Range',
    category: 'Household',
    brand: 'Harpic',
    price: 89,
    mrp: 99,
    unit: '500ml Bottle',
    badge: 'Popular',
    image: harpic,
    addedAt: '2026-01-01T00:00:01.000Z',
  },
  {
    id: 'seed-3',
    name: 'Good Knight Gold Flash',
    category: 'Personal Care',
    brand: 'Good Knight',
    price: 149,
    mrp: 175,
    unit: 'Machine + Refill Pack',
    badge: 'New',
    image: goodknight,
    addedAt: '2026-01-01T00:00:02.000Z',
  },
  {
    id: 'seed-4',
    name: 'Godrej No.1 Aloe Vera Soap',
    category: 'Bath & Body',
    brand: 'Godrej',
    price: 99,
    mrp: 140,
    unit: 'Pack of 4 x 100g',
    badge: 'Value Pack',
    image: godrejSoap,
    addedAt: '2026-01-01T00:00:03.000Z',
  },
  {
    id: 'seed-5',
    name: 'Closeup Triple Fresh Toothpaste',
    category: 'Oral Care',
    brand: 'Closeup',
    price: 55,
    mrp: 65,
    unit: '80g Tube',
    badge: '',
    image: closeup,
    addedAt: '2026-01-01T00:00:04.000Z',
  },
  {
    id: 'seed-6',
    name: 'Margo Neem Soap',
    category: 'Bath & Body',
    brand: 'Margo',
    price: 45,
    mrp: 55,
    unit: 'Pack of 3 x 75g',
    badge: 'Natural',
    image: margoSoap,
    addedAt: '2026-01-01T00:00:05.000Z',
  },
  {
    id: 'seed-7',
    name: "Lay's Chilli Flavour Chips",
    category: 'Food & Snacks',
    brand: "Lay's",
    price: 20,
    mrp: 20,
    unit: '26g Pack',
    badge: 'Hot Pick',
    image: laysChilli,
    addedAt: '2026-01-01T00:00:06.000Z',
  },
  {
    id: 'seed-8',
    name: 'Garam Masala Blend',
    category: 'Food & Snacks',
    brand: 'House Brand',
    price: 65,
    mrp: 80,
    unit: '100g Jar',
    badge: 'Offer',
    image: garamMasala,
    addedAt: '2026-01-01T00:00:07.000Z',
  },
  {
    id: 'seed-9',
    name: 'Wheat Flour (Atta)',
    category: 'Food & Snacks',
    brand: 'Aashirvaad',
    price: 210,
    mrp: 235,
    unit: '5 kg Bag',
    badge: 'Daily Essential',
    image: wheatFlour,
    addedAt: '2026-01-01T00:00:08.000Z',
  },
];
