const express   = require("express");
const Razorpay  = require("razorpay");
const crypto    = require("crypto");
const router    = express.Router();
const { verifyToken } = require("../Utils/authMiddleware");

// Initialise Razorpay instance
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create-order
// Body: { amount: Number (in rupees), currency?: String }
// Returns: { orderId, amount, currency, key }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Payment gateway is not configured. Please contact support or use Cash on Delivery." });
    }

    const { amount, currency = "INR" } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount:  Math.round(Number(amount) * 100), // convert Rs → paise
      currency,
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay create-order error:", err.message);
    res.status(500).json({ message: "Payment gateway error. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Returns: { verified: true } or 400
// ─────────────────────────────────────────────────────────────────────────────
router.post("/verify", verifyToken, (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields." });
    }

    // Generate expected HMAC-SHA256 signature
    const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    res.status(200).json({ verified: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error("Razorpay verify error:", err.message);
    res.status(500).json({ message: "Error verifying payment." });
  }
});

module.exports = router;
