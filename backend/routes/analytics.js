// routes/analytics.js
import express from "express";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import FAQ from "../models/FAQ.js";
import Knowledge from "../models/Knowledge.js";

const router = express.Router();

/**
 * GET /admin/analytics/summary
 * Returns total counts for dashboard summary cards
 */
router.get("/summary", async (req, res) => {
  try {
    const [userCount, convoCount, faqCount, knowledgeCount] = await Promise.all([
      User.countDocuments(),
      Conversation.countDocuments(),
      FAQ.countDocuments(),
      Knowledge.countDocuments(),
    ]);

    res.json({
      users: userCount,
      conversations: convoCount,
      faqs: faqCount,
      knowledge: knowledgeCount,
    });
  } catch (err) {
    console.error("Analytics summary error:", err);
    res.status(500).json({ message: "Server error fetching summary data." });
  }
});

/**
 * GET /admin/analytics/charts
 * Returns simple daily stats for charts
 */
router.get("/charts", async (req, res) => {
  try {
    // For now: generate mock chart data (replace with aggregation logic later)
    const today = new Date();
    const chartData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      chartData.push({
        date: date.toISOString().split("T")[0],
        users: Math.floor(Math.random() * 10) + 2,
        conversations: Math.floor(Math.random() * 20) + 5,
        faqs: Math.floor(Math.random() * 3),
        knowledge: Math.floor(Math.random() * 5),
      });
    }

    res.json(chartData);
  } catch (err) {
    console.error("Analytics chart error:", err);
    res.status(500).json({ message: "Server error fetching chart data." });
  }
});

export default router;
