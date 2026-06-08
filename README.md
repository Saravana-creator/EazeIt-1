# EAZEIT Annachi Kadai

A full-stack grocery and ecommerce application built with React on the frontend and Express/MongoDB on the backend. The project includes authentication, product browsing, cart and checkout flows, contact feedback with EmailJS support, order persistence, and admin features.

## 🚀 What’s Included

- React frontend with `react-router-dom`, Context API and reusable components.
- Express backend with JWT authentication, MongoDB persistence, and secured API routes.
- Contact page integration using EmailJS and backend feedback storage.
- Razorpay payment order creation and verification support.
- Admin-only product management and feedback listing.
- Production-ready static serving from backend when deployed.

## 📁 Repository Structure

- `backend/`
  - `Server.js` — Express app entrypoint.
  - `Controllers/` — Business logic for users, orders, products, payments, feedback.
  - `Models/` — Mongoose schemas for users, products, orders, feedback.
  - `Routers/` — Express router definitions.
  - `Utils/` — Authentication middleware and helpers.
  - `.env` — Backend environment variables.

- `frontend/`
  - `src/` — React app sources.
  - `src/components/` — Shared UI components.
  - `src/pages/` — Route pages like Home, Products, Cart, Profile, Contact.
  - `src/context/` — Global state providers.
  - `src/utils/` — API wrapper, storage helpers and common utilities.
  - `.env` — Frontend environment variables.

## ✅ Core Features

- User registration, login, logout, and profile editing.
- Product listing, product details, and shopping cart.
- Checkout with address, payment method, and order confirmation.
- Contact form that sends EmailJS email notifications and persists feedback.
- Admin dashboard links for product management and feedback review.
- Responsive layout with modern Tailwind-inspired styling.

## 🧩 Environment Setup

### Backend

Create or update `backend/.env` with:

```env
NODE_ENV=development
MONGO_URL=<your-mongodb-connection-string>
PORT=5000
JWT_SECRET=<your-jwt-secret>
ADMIN_EMAIL=admin@eazeit.in
ADMIN_PASSWORD=Admin@123
ALLOWED_ORIGINS=http://localhost:3000
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
```

### Frontend

Create or update `frontend/.env` with:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=EAZEIT Annachi Kadai
REACT_APP_VERSION=2.0.0
REACT_APP_EMAILJS_SERVICE_ID=sara24052007
REACT_APP_EMAILJS_TEMPLATE_ID=template_l8lwjue
REACT_APP_EMAILJS_USER_ID=<your-emailjs-user-id>
```

> If you do not want to commit active environment values, be sure `.env` is ignored by Git.

## 🛠️ Setup and Run Locally

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

3. Start the backend server:

   ```bash
   cd ../backend
   npm run dev
   ```

4. Start the frontend app:

   ```bash
   cd ../frontend
   npm start
   ```

5. Open the app in your browser at `http://localhost:3000`.

## 🚀 Deployed Links

- **Frontend (Vercel)**: [https://eaze-it-1.vercel.app/](https://eaze-it-1.vercel.app/)
- **Backend API (Render)**: [https://eazeit-backend-59lg.onrender.com/api](https://eazeit-backend-59lg.onrender.com/api)

## 🌐 Deployment details

The application is ready for production deployment:
- **SPA Routing**: The frontend is configured with a `vercel.json` file to route all page requests back to `index.html` (supporting React Router paths like `/cart` or `/profile`).
- **Dynamic CORS**: The backend automatically allows connections from `localhost` and any Vercel subdomain (`*.vercel.app`), ensuring CORS does not block newly generated deployment URLs.
- **Database Caching & Storage**: Offline local storage caches for users, addresses, orders, and products have been completely replaced with real-time MongoDB interactions. The local storage is only utilized for persisting the shopping cart.

## 🌐 API Endpoints

### Authentication

- `POST /api/users/signup`
- `POST /api/users/login`
- `GET /api/users/profile/:email`
- `PUT /api/users/profile/:email`

### Products

- `GET /api/products`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Orders

- `POST /api/orders`
- `GET /api/orders/user/:email`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/status` (admin)

### Payments

- `POST /api/payment/create-order`
- `POST /api/payment/verify`

### Feedback

- `POST /api/feedback`
- `GET /api/feedback` (admin)

## 📦 Production Build

From the repository root, install both sides and build the frontend:

```bash
npm install-all
npm run build
```

Then start the backend server from the repository root:

```bash
npm start
```

If you prefer to build manually from the frontend folder:

```bash
cd frontend
npm install
npm run build
```

Then start the backend server from `backend`:

```bash
cd ../backend
npm start
```

In production mode, `backend/Server.js` serves the compiled frontend from `frontend/build`.

## 💡 Notes

- The frontend uses `sessionStorage` for auth tokens.
- The contact form sends emails through EmailJS and also saves messages to the backend.
- `backend/.env` should contain secure values for MongoDB, JWT, and Razorpay keys.
- `frontend/.env` should contain EmailJS public identifiers and the API base URL.

## 📌 Removed Files

- `COMPLETE_PROJECT_DOCUMENTATION.md`
- `MASTER_PROMPT_COMPLETE.md`

These files were removed to keep the repository focused on the application source and deployment docs.
