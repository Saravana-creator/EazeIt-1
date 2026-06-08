const Order = require("../Models/OrderModel");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@eazeit.in").toLowerCase();

const DELIVERY_FREE_THRESHOLD = 500;
const DELIVERY_FEE_AMOUNT = 10;

function calculateDeliveryFee(subtotal) {
  const amount = Number(subtotal) || 0;
  return amount >= DELIVERY_FREE_THRESHOLD ? 0 : DELIVERY_FEE_AMOUNT;
}

function ensureNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

// ── Helper: generate a unique, collision-safe order ID ───────────────────────
async function generateOrderId() {
  // Use timestamp + random suffix to avoid race conditions
  const ts     = Date.now().toString(36).toUpperCase();
  const rand   = Math.random().toString(36).substring(2, 5).toUpperCase();
  const candidate = `EZ-${ts}-${rand}`;

  // Ensure uniqueness in DB (extremely unlikely collision but defensive)
  const exists = await Order.findOne({ orderId: candidate });
  if (exists) {
    // Recursively try again (tail-recursion safe in Node)
    return generateOrderId();
  }
  return candidate;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders  — place a new order (logged-in user)
// ─────────────────────────────────────────────────────────────────────────────
const PlaceOrder = async (req, res) => {
  try {
    const {
      userEmail,
      items,
      address,
      paymentMethod,
      subtotal,
      deliveryFee,
      total,
      razorpayPaymentId,
    } = req.body;

    const normalizedEmail = String(userEmail || req.user?.email || '').toLowerCase().trim();
    const itemCount = Array.isArray(items) ? items.length : 0;
    const subtotalAmount = ensureNumber(subtotal, 0);
    const computedDeliveryFee = calculateDeliveryFee(subtotalAmount);
    const expectedTotal = subtotalAmount + computedDeliveryFee;

    if (!normalizedEmail || itemCount === 0 || !address || !address.name || !address.line1 || !address.city || !address.pincode || !address.phone) {
      return res.status(400).json({ message: "Missing required order fields." });
    }

    if (total != null && Number(total) !== expectedTotal) {
      return res.status(400).json({ message: "Order total does not match expected amount." });
    }

    // Users can only place orders for themselves (unless admin)
    if (req.user.role !== "admin" && req.user.email !== normalizedEmail) {
      return res.status(403).json({ message: "Access denied." });
    }

    const orderId = await generateOrderId();

    const order = new Order({
      orderId,
      userEmail:          normalizedEmail,
      items,
      address,
      paymentMethod:      paymentMethod || "COD",
      subtotal:           subtotalAmount,
      deliveryFee:        computedDeliveryFee,
      total:              expectedTotal,
      status:             "Confirmed",
      razorpayPaymentId:  razorpayPaymentId || null,
      placedAt:           new Date(),
    });

    const saved = await order.save();
    res.status(201).json({ message: "Order placed successfully.", order: saved });
  } catch (error) {
    res.status(500).json({ message: "Error placing order.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/user/:email  — get all orders for a specific user
// ─────────────────────────────────────────────────────────────────────────────
const GetUserOrders = async (req, res) => {
  try {
    const requestedEmail = req.params.email.toLowerCase();

    // Users can only see their own orders
    if (req.user.role !== "admin" && req.user.email !== requestedEmail) {
      return res.status(403).json({ message: "Access denied." });
    }

    let orders;
    if (req.user.role === "admin" && requestedEmail === ADMIN_EMAIL) {
      orders = await Order.find().sort({ placedAt: -1 });
    } else {
      orders = await Order.find({ userEmail: requestedEmail }).sort({ placedAt: -1 });
    }
    res.status(200).json({ orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:orderId  — get single order by orderId string (EZ-XXXX)
// ─────────────────────────────────────────────────────────────────────────────
const GetOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: "Order not found." });

    // Users can only see their own orders
    if (req.user.role !== "admin" && req.user.email !== order.userEmail) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders  — admin only: paginated list of ALL orders
// ─────────────────────────────────────────────────────────────────────────────
const GetAllOrders = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;
    const status = req.query.status || "";
    const search = req.query.search || "";

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderId:   { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ placedAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    // Quick revenue sum for the filtered result set
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    res.status(200).json({ orders, total, page, pages: Math.ceil(total / limit), revenue });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all orders.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/stats  — admin only: dashboard stats
// ─────────────────────────────────────────────────────────────────────────────
const GetOrderStats = async (req, res) => {
  try {
    const [total, pending, confirmed, delivered, cancelled] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Confirmed" }),
      Order.countDocuments({ status: "Delivered" }),
      Order.countDocuments({ status: "Cancelled" }),
    ]);

    // Total revenue (from delivered orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ["Confirmed", "Processing", "Shipped", "Delivered"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const revenue = revenueResult[0]?.total || 0;

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Order.countDocuments({ placedAt: { $gte: today } });

    res.status(200).json({ total, pending, confirmed, delivered, cancelled, revenue, todayCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order stats.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:orderId/status  — admin only: update order status
// ─────────────────────────────────────────────────────────────────────────────
const UpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Choose from: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found." });
    res.status(200).json({ message: "Order status updated.", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status.", error: error.message });
  }
};

module.exports = {
  PlaceOrder,
  GetUserOrders,
  GetOrderById,
  GetAllOrders,
  GetOrderStats,
  UpdateOrderStatus,
};
