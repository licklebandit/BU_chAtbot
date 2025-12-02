// /backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

// ✅ SIGNUP (default: role = "user")
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = (email || "").trim().toLowerCase();
    
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Case-insensitive email check
    const existing = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } 
    });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: "user", // prevent random admin creation
    });

    await newUser.save();

    res.json({ message: "✅ Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "❌ Error signing up. Please try again." });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Normalize email: trim whitespace and convert to lowercase for case-insensitive lookup
    const normalizedEmail = (email || "").trim().toLowerCase();
    
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Case-insensitive email lookup
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } 
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user has a password (in case of OAuth users)
    if (!user.password) {
      return res.status(400).json({ message: "Account setup incomplete. Please reset your password." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔥 Include role in token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "❌ Login failed. Please try again." });
  }
});

export default router;
