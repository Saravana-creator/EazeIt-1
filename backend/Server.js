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

// ── Determine allowed origins ────────────────────────────────────────────────
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.trim() : "*";
const ALLOWED_ORIGINS = [
  ...new Set(
    rawAllowedOrigins
      .split(",")
      .map((o) => o.trim())
      .filter((o) => o.length > 0)
      .concat([
        "https://eaze-it-1-kzgs1st6v-saravana-perumal-ms-projects.vercel.app",
        "https://eaze-it-1-ap8cacpuz-saravana-perumal-ms-projects.vercel.app",
        "https://eaze-it-1-25uotlgey-saravana-perumal-ms-projects.vercel.app",
      ])
  ),
];
const ALLOW_ALL_ORIGINS = ALLOWED_ORIGINS.includes("*");

// In production, add your deployed frontend URL via .env ALLOWED_ORIGINS
// e.g. ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
// If no ALLOWED_ORIGINS is defined, '*' is used as a fallback.

// ── Middleware ───────────────────────────────────────────────────────────────
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
    if (!origin || ALLOW_ALL_ORIGINS || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
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