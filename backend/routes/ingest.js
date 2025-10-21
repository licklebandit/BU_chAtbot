import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Knowledge from "../models/Knowledge.js";

dotenv.config();
const router = express.Router();

// ✅ Middleware: verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// ✅ Add or update knowledge (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { keyword, answer } = req.body;
    if (!keyword || !answer) return res.status(400).json({ message: "Keyword and answer required" });

    const existing = await Knowledge.findOne({ keyword });
    if (existing) {
      existing.answer = answer;
      await existing.save();
      return res.json({ message: "✅ Knowledge updated successfully" });
    }

    const newKnowledge = new Knowledge({ keyword, answer });
    await newKnowledge.save();
    res.json({ message: "✅ Knowledge added successfully" });
  } catch (error) {
    console.error("Ingest error:", error);
    res.status(500).json({ message: "❌ Failed to save knowledge" });
  }
});

// ✅ Get all knowledge (for admin dashboard)
router.get("/", verifyToken, async (req, res) => {
  try {
    const allKnowledge = await Knowledge.find();
    res.json(allKnowledge);
  } catch (error) {
    res.status(500).json({ message: "❌ Could not fetch knowledge" });
  }
});

export default router;
