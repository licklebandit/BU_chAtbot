// routes/adminRouter.js
import express from "express";
import FAQ from "../models/FAQ.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import { io } from "../server.js";

const router = express.Router();

/* --------------------------------------------------------
   🔹 Helpers
-------------------------------------------------------- */

// Pagination utility
const getPaginatedResults = async (model, page = 1, limit = 10, query = {}) => {
  const skip = (page - 1) * limit;
  const [results, total] = await Promise.all([
    model.find(query).skip(skip).limit(limit),
    model.countDocuments(query),
  ]);
  return {
    results,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
};

// Date helpers
const getYesterday = () => new Date(Date.now() - 24 * 60 * 60 * 1000);
const getTwoWeeksAgo = () => new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

// Emit metrics to all connected admin dashboards
const emitAdminStats = async () => {
  try {
    const yesterday = getYesterday();
    const [chatsToday, totalUsers, activeUsersToday] = await Promise.all([
      Conversation.countDocuments({ createdAt: { $gte: yesterday } }),
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: yesterday } }),
    ]);

    io.to("adminRoom").emit("adminStatsUpdate", {
      chatsToday,
      totalUsers,
      activeUsersToday,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error emitting admin stats:", err);
  }
};

/* --------------------------------------------------------
   🔹 ROUTES
-------------------------------------------------------- */

// 1️⃣ Dashboard Metrics & Charts
router.get("/metrics", async (req, res) => {
  try {
    const yesterday = getYesterday();
    const twoWeeksAgo = getTwoWeeksAgo();

    const [chatsToday, totalUsers, activeUsersToday, chatsOverTime] = await Promise.all([
      Conversation.countDocuments({ createdAt: { $gte: yesterday } }),
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: yesterday } }),
      Conversation.aggregate([
        { $match: { createdAt: { $gte: twoWeeksAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Average response time (ms)
    const recent = await Conversation.find({ createdAt: { $gte: yesterday } }).select("responseTimes");
    const avgResponseMs =
      recent.reduce((acc, c) => {
        const times = c.responseTimes || [];
        return acc + (times.reduce((s, t) => s + t, 0) / (times.length || 1));
      }, 0) / (recent.length || 1);

    const metricsPayload = {
      metrics: {
        chatsToday,
        totalUsers,
        activeUsersToday,
        avgResponseMs: Math.round(avgResponseMs),
        accuracyPct: 92, // Placeholder for ML-driven accuracy metric
      },
      chatsOverTime: chatsOverTime.map((d) => ({ date: d._id, count: d.count })),
      accuracyOverTime: [85, 87, 88, 90, 91, 92, 90, 93, 94, 95, 92, 93, 91, 92],
    };

    io.to("adminRoom").emit("metricsUpdate", metricsPayload);
    res.json(metricsPayload);
  } catch (err) {
    console.error("Metrics fetch error:", err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

// 2️⃣ Paginated Conversations List
router.get("/conversations", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "10")));
    const search = req.query.search || "";
    const filter = req.query.filter || "all";

    const query = {};

    if (search) {
      query.$or = [
        { user_name: { $regex: search, $options: "i" } },
        { snippet: { $regex: search, $options: "i" } },
      ];
    }

    if (filter === "unread") query.isUnread = true;
    if (req.query.from) {
      const from = new Date(req.query.from);
      if (!isNaN(from)) query.createdAt = { $gte: from };
    }
    if (req.query.to) {
      const to = new Date(req.query.to);
      if (!isNaN(to)) {
        to.setHours(23, 59, 59, 999);
        query.createdAt = { ...(query.createdAt || {}), $lte: to };
      }
    }

    const paginated = await getPaginatedResults(Conversation, page, limit, query);

    const response = {
      conversations: paginated.results.map((c) => ({
        id: c._id,
        user_name: c.user_name,
        snippet: c.snippet,
        createdAt: c.createdAt,
        isUnread: c.isUnread,
      })),
      pagination: paginated.pagination,
    };

    io.to("adminRoom").emit("conversationsUpdate", response);
    res.json(response);
  } catch (err) {
    console.error("Conversations fetch error:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// 3️⃣ Single Conversation (Full Transcript)
router.get("/conversations/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });
    res.json(conversation);
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid conversation ID format" });
    console.error("Conversation detail error:", err);
    res.status(500).json({ error: "Failed to fetch conversation details" });
  }
});

// 4️⃣ Mark Conversation as Read
router.put("/conversations/:id/read", async (req, res) => {
  try {
    const convo = await Conversation.findByIdAndUpdate(
      req.params.id,
      { isUnread: false },
      { new: true }
    );
    if (!convo) return res.status(404).json({ error: "Conversation not found" });
    res.json({ message: "Conversation marked as read" });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid conversation ID format" });
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// 5️⃣ FAQs
router.get("/faqs", async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.json(faqs);
  } catch {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

router.post("/faqs", async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faq = await FAQ.create({ question, answer });
    io.to("adminRoom").emit("faqAdded", faq);
    res.status(201).json(faq);
  } catch (err) {
    console.error("FAQ add error:", err);
    res.status(400).json({ error: "Failed to add FAQ" });
  }
});

router.delete("/faqs/:id", async (req, res) => {
  try {
    const result = await FAQ.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "FAQ not found" });
    io.to("adminRoom").emit("faqDeleted", req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

// 6️⃣ Users Management
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password -__v").sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role },
      { new: true }
    ).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    io.to("adminRoom").emit("userUpdated", user);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    io.to("adminRoom").emit("userDeleted", req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// 7️⃣ Admins list
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password -__v");
    res.json(admins);
  } catch {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

// 8️⃣ CSV Bulk Import
router.post("/users/import", async (req, res) => {
  const users = req.body;
  if (!Array.isArray(users) || !users.length)
    return res.status(400).json({ error: "Invalid user data" });

  try {
    const inserted = await User.insertMany(users, { ordered: false });
    io.to("adminRoom").emit("usersImported", inserted.length);
    res.status(201).json({
      message: `Imported ${inserted.length} users.`,
      importedCount: inserted.length,
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: "Duplicate key in import" });
    res.status(500).json({ error: "Failed to import users" });
  }
});

/* --------------------------------------------------------
   🔹 Export
-------------------------------------------------------- */
export default router;
