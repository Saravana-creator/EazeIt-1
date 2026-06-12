# 🛒 EazeIt — Project Overview

> A full-stack grocery e-commerce web app built with React (frontend) and Node.js + MongoDB (backend), deployed on Vercel (frontend) + Render (backend).

---

## 🧱 Tech Stack

| Layer       | Technology                                 |
|-------------|---------------------------------------------|
| Frontend    | React, React Router, Context API, CSS       |
| Backend     | Node.js, Express.js                         |
| Database    | MongoDB Atlas (via Mongoose)                |
| Auth        | JWT (JSON Web Tokens) + bcrypt              |
| Payments    | Razorpay (UPI / Card / COD)                 |
| Deployment  | Vercel (frontend) · Render (backend)        |

---

## 📁 Project Structure

```
Annachi_Kadai/
├── backend/
│   ├── Server.js              ← Express app entry point
│   ├── Models/                ← Mongoose schemas
│   ├── Controllers/           ← Business logic
│   ├── Routers/               ← API route definitions
│   └── Utils/
│       └── authMiddleware.js  ← JWT verification
└── frontend/
    └── src/
        ├── App.jsx            ← Root component
        ├── Router/AppRouter   ← All routes + route guards
        ├── Context/           ← Global state (Cart, Products)
        ├── Pages/             ← 15 page components
        ├── Components/        ← Shared UI (Navbar, Footer, etc.)
        └── Utils/             ← API helpers, storage utils
```

---

## ⚙️ Backend — Functions & Why They Matter

### `Server.js` — App Entry Point
Sets up Express, CORS, Helmet, compression, MongoDB connection, and mounts all route groups. Also handles graceful shutdown and unhandled errors so the server doesn't silently crash in production.

---

### `Utils/authMiddleware.js`

| Function       | Why It's Important |
|----------------|--------------------|
| `verifyToken`  | Guards every private endpoint — decodes the JWT from the `Authorization` header and attaches `req.user`. Without this, anyone could access other users' data. |
| `verifyAdmin`  | Second layer on top of `verifyToken` — blocks non-admin users from admin-only routes like product management and order status updates. |

---

### `Controllers/UserController.js`

| Function         | Why It's Important |
|------------------|--------------------|
| `SignUpUser`     | Creates a new user account with a bcrypt-hashed password. Blocks registration with the admin email. |
| `LoginUser`      | Authenticates user credentials (or static admin credentials) and returns a 7-day JWT token that drives all subsequent authenticated requests. |
| `GetProfile`     | Allows a user to fetch their own profile data (or admin to fetch anyone's). |
| `UpdateProfile`  | Lets users update name/phone without touching the password. |
| `GetAllUsers`    | Admin dashboard — paginated, searchable list of all registered users. |
| `GetUserStats`   | Powers the admin dashboard KPI card (total users + new signups today). |
| `GetAddresses`   | Fetches saved delivery addresses for checkout pre-fill. |
| `AddAddress`     | Saves a new delivery address; auto-assigns "default" to the first one added. |
| `DeleteAddress`  | Removes an address and re-assigns the default if needed. |
| `ChangePassword` | Lets authenticated users securely update their password (bcrypt re-hash). |
| `CheckEmail`     | Used in the Forgot Password flow — confirms if the email exists before letting the user proceed to reset. |
| `DeleteUser`     | Admin can remove any user account (cannot delete their own). |
| `UpdateUserRole` | Admin can promote/demote users between `user` and `admin` roles. |

---

### `Controllers/ProductController.js`

| Function          | Why It's Important |
|-------------------|--------------------|
| `GetAllProducts`  | Public endpoint — supports filtering by category, brand, search query, and price sorting. The entire Products page depends on this. |
| `GetProductById`  | Fetches a single product's full details. |
| `AddProduct`      | Admin-only — adds a new product to the catalogue (name, price, category, image, etc.). |
| `UpdateProduct`   | Admin-only — edits existing product details in-place. |
| `DeleteProduct`   | Admin-only — permanently removes a product from the store. |

---

### `Controllers/OrderController.js`

| Function            | Why It's Important |
|---------------------|--------------------|
| `generateOrderId`   | Creates a collision-safe, human-readable ID like `EZ-ABC123-XYZ` for every order. |
| `PlaceOrder`        | Core checkout function — validates order data, recomputes the delivery fee server-side (cannot be spoofed by the client), and persists the order. |
| `GetUserOrders`     | Lets a logged-in user see their order history. If admin calls it with the admin email, it returns ALL orders. |
| `GetOrderById`      | Fetches a single order by its `EZ-XXXX` ID — used on the Order Success page. |
| `GetAllOrders`      | Admin dashboard — paginated, filterable list of every order with inline revenue calculation. |
| `GetOrderStats`     | Powers admin KPI cards: total, pending, confirmed, delivered, cancelled counts + total revenue. |
| `UpdateOrderStatus` | Admin can move an order through its lifecycle (Confirmed → Processing → Shipped → Delivered / Cancelled). |

---

### `Routers/PaymentRoutes.js` (Razorpay Integration)

| Endpoint                       | Why It's Important |
|--------------------------------|--------------------|
| `POST /api/payment/create-order` | Creates a Razorpay order on the backend (never expose Razorpay secrets to the browser). Returns the order ID and public key to the frontend. |
| `POST /api/payment/verify`       | Server-side HMAC-SHA256 signature verification — confirms the payment actually came from Razorpay and wasn't tampered with. |

---

### `Controllers/FeedbackController.js`

| Function           | Why It's Important |
|--------------------|--------------------|
| `createFeedback`   | Saves contact form submissions from users to MongoDB so they're never lost. |
| `getAllFeedback`    | Admin can view all submitted feedback from the dashboard. |

---

## 🌐 Frontend — Architecture & Flow

### Global State (Context API)

| Context           | What It Manages |
|-------------------|-----------------|
| `ProductContext`  | Fetches all products from the API on app load. Provides `addProduct`, `updateProduct`, `deleteProduct`, `refreshProducts` for admin operations. Single source of truth for the product catalogue. |
| `CartContext`     | Manages the shopping cart state (`cartItems`, `cartCount`, `subtotal`, `deliveryFee`, `total`). Persists cart to `localStorage` so it survives page refresh. Provides `addToCart`, `updateQty`, `removeFromCart`, `clearCart`. |

---

### Routing (`AppRouter.jsx`)

Three route tiers with two custom guards:

| Guard           | Behaviour |
|-----------------|-----------|
| `ProtectedRoute` | Reads session from `sessionStorage`. If no user found, redirects to `/login?redirect=<current path>` so after login the user lands back where they were. |
| `AdminRoute`    | Extends `ProtectedRoute` — also checks `user.role === 'admin'`. Non-admins are bounced to home. |
| `AppLayout`     | Wraps every page with `Navbar` + `Footer`. These are hidden on auth-only pages (`/login`, `/signup`, `/forgot-password`, `/admin`) for a clean, focused UI. |

---

## 🔄 Complete User Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                             BROWSER (React SPA)                              │
│                                                                              │
│  1. App loads → ProductContext fetches all products from /api/products       │
│                 CartContext loads cart from localStorage                      │
│                                                                              │
│  2. Guest browses Home → Products (filter/search/sort via ProductContext)    │
│     └── Adds items to Cart → CartContext updates state + localStorage        │
│                                                                              │
│  3. Checkout clicked → ProtectedRoute checks sessionStorage                  │
│     ├── Not logged in? → Redirect to /login?redirect=/checkout               │
│     └── Logged in? → Proceed to Checkout page                                │
│                                                                              │
│  4. Signup / Login                                                           │
│     ├── POST /api/users/signup or /login                                     │
│     ├── Server hashes password (bcrypt), issues JWT                          │
│     └── Frontend stores { token, user } in sessionStorage                   │
│                                                                              │
│  5. Checkout Page                                                            │
│     ├── Loads saved addresses from /api/users/addresses/:email               │
│     ├── User selects/adds address, picks payment method                      │
│     │                                                                        │
│     ├── [COD path]                                                           │
│     │   └── POST /api/orders → Order saved → Redirect to /order-success     │
│     │                                                                        │
│     └── [Online Payment path — UPI / Card]                                   │
│         ├── POST /api/payment/create-order → Razorpay order ID returned     │
│         ├── Razorpay SDK opens payment modal in browser                      │
│         ├── On success → POST /api/payment/verify (HMAC signature check)    │
│         └── Payment verified → POST /api/orders → Redirect to /order-success│
│                                                                              │
│  6. Order Success Page — fetches order by EZ-XXXX ID, shows summary         │
│                                                                              │
│  7. Profile Page                                                             │
│     ├── View / edit personal info → PUT /api/users/profile/:email           │
│     ├── Manage saved addresses (add/delete)                                  │
│     ├── View order history → GET /api/orders/user/:email                    │
│     └── Change password → PUT /api/users/change-password/:email             │
│                                                                              │
│  8. Admin Panel (/admin — AdminRoute guarded)                                │
│     ├── Dashboard KPIs: user stats, order stats, revenue                    │
│     ├── Manage Products: add / edit / delete via ProductContext              │
│     ├── Manage Orders: view all orders, update status                       │
│     ├── Manage Users: list, search, change role, delete                     │
│     └── View Feedback from Contact page                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Auth & Security Summary

| Concern           | How It's Handled |
|-------------------|------------------|
| Password storage  | `bcrypt` hash (cost factor 12) — never stored plain |
| Session token     | JWT (7-day expiry), signed with `JWT_SECRET` from `.env` |
| Route protection  | `verifyToken` + `verifyAdmin` middleware on every private API route |
| Payment security  | Razorpay secret stays server-side; signature verified via HMAC-SHA256 |
| CORS              | Pattern-based allowlist — `*.vercel.app` + `localhost:*` + explicit env origins |
| Admin account     | Hardcoded credentials in `.env`, no DB record — impossible to accidentally delete |

---

## 📄 Pages at a Glance

| Page              | Access       | Purpose |
|-------------------|--------------|---------|
| `/`               | Public       | Hero, featured products, categories |
| `/products`       | Public       | Full catalogue with filter / search / sort |
| `/cart`           | Public       | Review cart items, see totals |
| `/login`          | Public       | Email + password login |
| `/signup`         | Public       | New account registration |
| `/forgot-password`| Public       | Email check → password reset |
| `/checkout`       | 🔒 Auth      | Address selection + payment flow |
| `/order-success/:id`| 🔒 Auth    | Post-order confirmation screen |
| `/profile`        | 🔒 Auth      | Personal info, addresses, order history |
| `/admin`          | 🛡️ Admin    | Full management dashboard |
| `/about`          | Public       | About the store |
| `/contact`        | Public       | Contact / feedback form |
| `/faq`            | Public       | Frequently asked questions |
| `/privacy`        | Public       | Privacy policy |
| `/terms`          | Public       | Terms and conditions |
