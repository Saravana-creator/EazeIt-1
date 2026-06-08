const express = require("express");
const router  = express.Router();
const {
  SignUpUser,
  LoginUser,
  GetProfile,
  UpdateProfile,
  GetAllUsers,
  GetUserStats,
  GetAddresses,
  AddAddress,
  DeleteAddress,
  ChangePassword,
  CheckEmail,
} = require("../Controllers/UserController");
const { verifyToken, verifyAdmin } = require("../Utils/authMiddleware");

// ── Public routes ────────────────────────────────────────────────────────────
router.post("/signup",      SignUpUser);
router.post("/login",       LoginUser);
router.post("/check-email", CheckEmail); // forgot-password: check if email exists
router.put("/change-password/:email", ChangePassword); // forgot-password: reset password (no token needed)

// ── Admin only ───────────────────────────────────────────────────────────────
// NOTE: /stats must come before /:email to avoid param collision
router.get("/stats", verifyToken, verifyAdmin, GetUserStats);
router.get("/",      verifyToken, verifyAdmin, GetAllUsers);

// ── Protected (own user or admin) ────────────────────────────────────────────
router.get("/profile/:email", verifyToken, GetProfile);
router.put("/profile/:email", verifyToken, UpdateProfile);

// ── Address management ───────────────────────────────────────────────────────
router.get("/addresses/:email",                verifyToken, GetAddresses);
router.post("/addresses/:email",               verifyToken, AddAddress);
router.delete("/addresses/:email/:addressId",  verifyToken, DeleteAddress);

// ── Password change (authenticated — profile settings) ───────────────────────
// router.put("/change-password/:email", verifyToken, ChangePassword);
// Note: The public version above is used for forgot-password flow.

module.exports = router;