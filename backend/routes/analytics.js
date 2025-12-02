// routes/analytics.js
import express from "express";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Knowledge from "../models/Knowledge.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All analytics routes require admin authentication
router.use(verifyAdmin);

/**
 * GET /admin/analytics/summary
 * Returns total counts for dashboard summary cards
 */
router.get("/summary", async (req, res) => {
  try {
    const [userCount, convoCount, faqCount, knowledgeCount] = await Promise.all([
      User.countDocuments(),
      Chat.countDocuments(),
      Knowledge.countDocuments({ type: "faq" }),
      Knowledge.countDocuments({ $or: [{ type: { $exists: false } }, { type: "knowledge" }] }),
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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [userGrowth, chatGrowth] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Chat.aggregate([
        { $match: { updatedAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const dailyMap = (records) =>
      records.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {});

    const userMap = dailyMap(userGrowth);
    const chatMap = dailyMap(chatGrowth);

    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const key = date.toISOString().split("T")[0];
      chartData.push({
        date: key,
        users: userMap[key] || 0,
        conversations: chatMap[key] || 0,
      });
    }

    res.json(chartData);
  } catch (err) {
    console.error("Analytics chart error:", err);
    res.status(500).json({ message: "Server error fetching chart data." });
  }
});

export default router;
