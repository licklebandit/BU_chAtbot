// backend/routes/adminRouter.js
import express from "express";
import User from "../models/User.js"; // Assumes User model exists
import Conversation from "../models/Conversation.js"; // Assumes Conversation model exists
import Knowledge from "../models/Knowledge.js"; // Assumes Knowledge model exists (for FAQ/KB)
import { hash } from 'bcrypt'; // Need bcrypt to hash passwords

const router = express.Router();

/* ---------------------------
    HELPER: Filter Admins
--------------------------- */
// Endpoint to fetch only admin users for AdminsView
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select("-password").sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ message: "Server error fetching admins" });
  }
});

/* ---------------------------
    CREATE USER (Admin/User)
--------------------------- */
// Used by both UserModal and AdminModal
router.post("/users", async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists." });
    }

    // Hash password before saving
    const hashedPassword = await hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user', // Default to 'user'
    });

    const savedUser = await newUser.save();
    // Return the new user without the password
    res.status(201).json(savedUser.toObject({ getters: true }).password = undefined && savedUser); 
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error creating user" });
  }
});


/* ---------------------------
    UPDATE USER/ADMIN
--------------------------- */
// Handles updating user/admin details (name, role, and optional password change)
router.put("/users/:id", async (req, res) => {
  try {
    const { name, role, password } = req.body;
    const updateFields = { name, role };

    if (password) {
      // If a new password is provided, hash it
      updateFields.password = await hash(password, 10);
    }
    
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
        return res.status(404).json({ message: "User not found." });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error updating user" });
  }
});

/* ---------------------------
    DASHBOARD STATS (Unchanged)
--------------------------- */
router.get("/stats", async (req, res) => {
  try {
    const [users, conversations, knowledge] = await Promise.all([
      User.countDocuments(),
      Conversation.countDocuments(),
      Knowledge.countDocuments(),
    ]);

    res.json({ users, conversations, knowledge });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ message: "Server error fetching stats" });
  }
});

/* ---------------------------
    GET ALL USERS (Unchanged)
--------------------------- */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

/* ---------------------------
    IMPORT USERS (CSV upload) (Unchanged)
--------------------------- */
router.post("/import-users", async (req, res) => {
  try {
    const users = req.body; 
    if (!Array.isArray(users)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const formatted = users.map(u => ({
      name: u.name || "Unnamed User",
      email: u.email,
      role: u.role || "user",
    }));

    // NOTE: This assumes email validation and hashing is handled elsewhere or is not required for imports.
    await User.insertMany(formatted, { ordered: false });
    res.json({ message: "Users imported successfully", count: formatted.length });
  } catch (err) {
    console.error("Error importing users:", err);
    res.status(500).json({ message: "Server error importing users" });
  }
});

/* ---------------------------
    DELETE USER/ADMIN (Unchanged)
--------------------------- */
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

/* ---------------------------
    ANALYTICS ENDPOINTS (Unchanged)
--------------------------- */

router.get("/analytics/conversations", async (req, res) => {
  // ... (unchanged analytics code)
});

router.get("/analytics/faqs", async (req, res) => {
  // ... (unchanged analytics code)
});

router.get("/analytics/users", async (req, res) => {
  // ... (unchanged analytics code)
});

export default router;