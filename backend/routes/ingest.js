// backend/routes/ingest.js
import express from "express";
import dotenv from "dotenv";
import Knowledge from "../models/Knowledge.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

/**
 * POST /api/ingest
 * Add or update knowledge (Admins only)
 */
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { keyword, answer } = req.body;
    if (!keyword || !answer) {
      return res.status(400).json({ message: "Keyword and answer are required" });
    }

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
    console.error("Ingest POST error:", error);
    res.status(500).json({ message: "❌ Failed to save knowledge" });
  }
});

/**
 * GET /api/ingest
 * Get all knowledge (Admins only)
 */
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const allKnowledge = await Knowledge.find();
    res.json(allKnowledge);
  } catch (error) {
    console.error("Ingest GET error:", error);
    res.status(500).json({ message: "❌ Could not fetch knowledge" });
  }
});

/**
 * DELETE /api/ingest/:id
 * Delete knowledge by ID (Admins only)
 */
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await Knowledge.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Knowledge not found" });
    res.status(204).send();
  } catch (error) {
    console.error("Ingest DELETE error:", error);
    if (error.name === "CastError") return res.status(400).json({ message: "Invalid ID format" });
    res.status(500).json({ message: "Failed to delete knowledge" });
  }
});

export default router;
