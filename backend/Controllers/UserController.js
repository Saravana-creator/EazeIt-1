const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const User     = require("../Models/UserModel");

const JWT_SECRET  = process.env.JWT_SECRET || "annachi_kadai_secret";
const JWT_EXPIRES = "7d";

// ── Admin Config from .env ──────────────────────────────────────────────────
const ADMIN_EMAIL    = (process.env.ADMIN_EMAIL    || "admin@eazeit.in").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD  || "Admin@123";

// ── Helper: generate JWT ────────────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users/signup
// ─────────────────────────────────────────────────────────────────────────────
const SignUpUser = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, password } = req.body;

    if (!firstname || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const emailLower = email.toLowerCase().trim();

    if (emailLower === ADMIN_EMAIL) {
      return res.status(400).json({ message: "Registration not allowed with this email address." });
    }

    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      firstname,
      lastname:  lastname || "",
      email:     emailLower,
      phone:     phone || "",
      password:  hashedPassword,
      role:      "user",
    });

    const savedUser = await newUser.save();
    const token     = generateToken(savedUser);

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id:        savedUser._id,
        firstname: savedUser.firstname,
        lastname:  savedUser.lastname,
        email:     savedUser.email,
        phone:     savedUser.phone,
        role:      savedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during registration.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users/login
// ─────────────────────────────────────────────────────────────────────────────
const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const emailLower = email.toLowerCase().trim();

    // ── Admin login ──────────────────────────────────────────────────────────
    if (emailLower === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        const token = jwt.sign(
          { id: "admin-static-id", email: ADMIN_EMAIL, role: "admin" },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES }
        );
        return res.status(200).json({
          message: "Admin login successful.",
          token,
          user: {
            id:        "admin-static-id",
            firstname: "Admin",
            lastname:  "EAZEIT",
            email:     ADMIN_EMAIL,
            phone:     "",
            role:      "admin",
          },
        });
      }
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // ── Regular user ─────────────────────────────────────────────────────────
    const user = await User.findOne({ email: emailLower });
    if (!user) return res.status(401).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id:        user._id,
        firstname: user.firstname,
        lastname:  user.lastname,
        email:     user.email,
        phone:     user.phone,
        role:      user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/profile/:email  — protected (own user or admin)
// ─────────────────────────────────────────────────────────────────────────────
const GetProfile = async (req, res) => {
  try {
    // Users can only fetch their own profile unless admin
    const requestedEmail = req.params.email.toLowerCase();
    if (req.user.role !== "admin" && req.user.email !== requestedEmail) {
      return res.status(403).json({ message: "Access denied." });
    }

    const user = await User.findOne({ email: requestedEmail }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/profile/:email  — protected (own user or admin)
// ─────────────────────────────────────────────────────────────────────────────
const UpdateProfile = async (req, res) => {
  try {
    const requestedEmail = req.params.email.toLowerCase();
    if (req.user.role !== "admin" && req.user.email !== requestedEmail) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { firstname, lastname, phone } = req.body;
    const updated = await User.findOneAndUpdate(
      { email: requestedEmail },
      { firstname, lastname, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ message: "Profile updated.", user: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users  — admin only: paginated list of all users
// ─────────────────────────────────────────────────────────────────────────────
const GetAllUsers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const search = req.query.search || "";
    const query  = search
      ? {
          $or: [
            { firstname: { $regex: search, $options: "i" } },
            { lastname:  { $regex: search, $options: "i" } },
            { email:     { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/stats  — admin only: quick stats for dashboard
// ─────────────────────────────────────────────────────────────────────────────
const GetUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await User.countDocuments({ createdAt: { $gte: today } });

    res.status(200).json({ total, newToday });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user stats.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/addresses/:email  — get saved addresses for a user
// ─────────────────────────────────────────────────────────────────────────────
const GetAddresses = async (req, res) => {
  try {
    const requestedEmail = req.params.email.toLowerCase();
    if (req.user.role !== "admin" && req.user.email !== requestedEmail) {
      return res.status(403).json({ message: "Access denied." });
    }
    const user = await User.findOne({ email: requestedEmail }).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ addresses: user.addresses || [] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching addresses.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users/addresses/:email  — add a new address
// ─────────────────────────────────────────────────────────────────────────────
const AddAddress = async (req, res) => {
  try {
    const requestedEmail = req.params.email.toLowerCase();
    if (req.user.role !== "admin" && req.user.email !== requestedEmail) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { label, name, line1, line2, city, pincode, phone, isDefault } = req.body;
    if (!name || !line1 || !city || !pincode || !phone) {
      return res.status(400).json({ message: "Name, line1, city, pincode, and phone are required." });
    }

    const user = await User.findOne({ email: requestedEmail });
    if (!user) return res.status(404).json({ message: "User not found." });

    const newAddr = {
      label:     label || "HOME",
      name,
      line1,
      line2:     line2 || "",
      city,
      pincode,
      phone,
      isDefault: !!isDefault,
    };

    // If new address should be default, unset all others
    if (newAddr.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }
    // If this is the first address, make it default
    if (user.addresses.length === 0) {
      newAddr.isDefault = true;
    }

    user.addresses.push(newAddr);
    await user.save();

    const saved = user.addresses[user.addresses.length - 1];
    res.status(201).json({ message: "Address added.", address: saved, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Error adding address.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/users/addresses/:email/:addressId  — delete an address
// ─────────────────────────────────────────────────────────────────────────────
const DeleteAddress = async (req, res) => {
  try {
    const requestedEmail = req.params.email.toLowerCase();
    if (req.user.role !== "admin" && req.user.email !== requestedEmail) {
      return res.status(403).json({ message: "Access denied." });
    }

    const user = await User.findOne({ email: requestedEmail });
    if (!user) return res.status(404).json({ message: "User not found." });

    const addrId = req.params.addressId;
    const idx = user.addresses.findIndex((a) => String(a._id) === addrId);
    if (idx === -1) return res.status(404).json({ message: "Address not found." });

    const wasDefault = user.addresses[idx].isDefault;
    user.addresses.splice(idx, 1);

    // If deleted address was default, make first remaining default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.status(200).json({ message: "Address deleted.", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Error deleting address.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/change-password/:email  — change password (authenticated)
// ─────────────────────────────────────────────────────────────────────────────
const ChangePassword = async (req, res) => {
  try {
    const requestedEmail = req.params.email.toLowerCase();
    if (req.user.role !== "admin" && req.user.email !== requestedEmail) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    const updated = await User.findOneAndUpdate(
      { email: requestedEmail },
      { password: hashed },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error changing password.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users/check-email  — check if email exists (for forgot password flow)
// Public endpoint
// ─────────────────────────────────────────────────────────────────────────────
const CheckEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });
    const emailLower = email.toLowerCase().trim();

    // Admin email always "exists" for forgot-password purposes
    if (emailLower === ADMIN_EMAIL) {
      return res.status(200).json({ exists: true });
    }

    const user = await User.findOne({ email: emailLower }).select("_id");
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: "Error checking email.", error: error.message });
  }
};

module.exports = {
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
};