const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
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

// ── Determine allowed origins ─────────────────────────────────────────────────
//
// Strategy: pattern-based — allows:
//   • Any *.vercel.app subdomain  (all preview + production Vercel deployments)
//   • Any localhost:* port        (local development)
//   • Any explicit origins listed in ALLOWED_ORIGINS env var
//
const EXPLICIT_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
);

const ALLOW_ALL_ORIGINS = EXPLICIT_ORIGINS.has("*");

function isOriginAllowed(origin) {
  if (!origin) return true;                          // same-origin / server-to-server
  if (ALLOW_ALL_ORIGINS) return true;                // wildcard override
  if (EXPLICIT_ORIGINS.has(origin)) return true;    // explicit whitelist from .env

  try {
    const { hostname, protocol } = new URL(origin);
    // Allow all Vercel deployments (preview + production + team URLs)
    if (hostname.endsWith(".vercel.app")) return true;
    // Allow localhost on any port during development
    if (
      (hostname === "localhost" || hostname === "127.0.0.1") &&
      (protocol === "http:" || protocol === "https:")
    ) return true;
  } catch {
    // invalid URL — deny
  }

  return false;
}

// In production set ALLOWED_ORIGINS in your Render/Railway env vars to restrict
// to your specific domain only, e.g.:
//   ALLOWED_ORIGINS=https://eaze-it-1.vercel.app
// During development leave it unset — localhost is always allowed.

// ── Middleware ────────────────────────────────────────────────────────────────
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// ── Rate Limiting ────────────────────────────────────────────────────────────
// Rate limiting has been disabled during initial creation and testing.
// Re-enable only after the application is stable and fully deployed.

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

// ── Health & Info endpoints (BEFORE static catch-all) ───────────────────────
app.get("/api/health", (req, res) =>
  res.json({
    status:  "ok",
    db:      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime:  process.uptime(),
  })
);

app.get("/api/info", (req, res) =>
  res.json({
    message: "🛒 EAZEIT API is running",
    env:     process.env.NODE_ENV || "development",
    version: "2.0.0",
  })
);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  // SPA fallback — all non-API GET requests serve index.html
  app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message, "path:", req.path, "origin:", req.headers.origin);
  if (err.message && (err.message.includes("not allowed by CORS") || err.message.includes("CORS blocked"))) {
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
      console.log(`🔓 Explicit allowed origins: [${Array.from(EXPLICIT_ORIGINS).join(", ") || "none"}]`);
      console.log(`🔓 Dynamic allowance: localhost (any port) and all *.vercel.app subdomains`);
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