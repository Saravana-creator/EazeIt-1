const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");
const helmet     = require("helmet");
const compression= require("compression");
const dns        = require("dns");
const path       = require("path");

// Force public DNS resolvers to prevent querySrv ECONNREFUSED resolution issues with MongoDB Atlas
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (dnsErr) {
  console.warn("⚠️ DNS configuration warning:", dnsErr.message);
}

require("dotenv").config();

const app = express();

// ── Determine allowed origins ────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// In production, you can add your deployed frontend URL via .env ALLOWED_ORIGINS
// e.g. ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app

// ── Middleware ───────────────────────────────────────────────────────────────
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, server-to-server, etc.)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Rate Limiting ────────────────────────────────────────────────────────────
// General API limiter — 200 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

// Strict limiter for auth endpoints — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again after 15 minutes." },
});

app.use("/api", generalLimiter);
app.use("/api/users/login",  authLimiter);
app.use("/api/users/signup", authLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────
const userRoutes    = require("./Routers/UserRoutes");
const productRoutes = require("./Routers/ProductRoutes");
const orderRoutes    = require("./Routers/OrderRoutes");
const paymentRoutes  = require("./Routers/PaymentRoutes");
const feedbackRoutes = require("./Routers/FeedbackRoutes");

app.use("/api/users",     userRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/orders",    orderRoutes);
app.use("/api/payment",   paymentRoutes);
app.use("/api/feedback",  feedbackRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({
    message: "🛒 Annachi Kadai API is running",
    env:     process.env.NODE_ENV || "development",
    version: "2.0.0",
  })
);

app.get("/api/health", (req, res) =>
  res.json({
    status:  "ok",
    db:      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime:  process.uptime(),
  })
);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  if (err.message && err.message.startsWith("CORS blocked")) {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).json({
    message: process.env.NODE_ENV === "production"
      ? "An internal server error occurred."
      : err.message,
  });
});

// ── Connect MongoDB → start server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000, // fail fast if Atlas unreachable
  })
  .then(() => {
    const dbName = mongoose.connection.name;
    console.log(`✅ MongoDB connected → db: "${dbName}"`);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔓 Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("   Hint: Check MONGO_URL in .env and ensure Atlas IP whitelist includes 0.0.0.0/0");
    process.exit(1);
  });

// ── Graceful Shutdown ────────────────────────────────────────────────────────
process.on("SIGINT",  () => { console.log("\n👋 Server stopping…"); mongoose.connection.close(); process.exit(0); });
process.on("SIGTERM", () => { console.log("\n👋 Server stopping…"); mongoose.connection.close(); process.exit(0); });
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});