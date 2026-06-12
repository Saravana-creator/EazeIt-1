const express = require("express");
const router  = express.Router();
const {
  PlaceOrder,
  GetUserOrders,
  GetOrderById,
  GetAllOrders,
  GetOrderStats,
  UpdateOrderStatus,
} = require("../Controllers/OrderController");
const { verifyToken, verifyAdmin } = require("../Utils/authMiddleware");

// ── Admin only ───────────────────────────────────────────────────────────────

router.get("/stats",           verifyToken, verifyAdmin, GetOrderStats);
router.get("/",                verifyToken, verifyAdmin, GetAllOrders);

// ── User: place a new order ──────────────────────────────────────────────────
router.post("/", verifyToken, PlaceOrder);

// ── User: get their own orders by email ─────────────────────────────────────
router.get("/user/:email", verifyToken, GetUserOrders);

// ── Get a single order by orderId string (EZ-XXXX) ──────────────────────────
router.get("/:orderId", verifyToken, GetOrderById);

// ── Admin: update order status ───────────────────────────────────────────────
router.put("/:orderId/status", verifyToken, verifyAdmin, UpdateOrderStatus);

module.exports = router;
