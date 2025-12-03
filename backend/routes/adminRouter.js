// backend/routes/adminRouter.js

import express from "express";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Knowledge from "../models/Knowledge.js";
import { hash } from "bcrypt";
import {
  verifyUser as isAuthenticated,
  verifyAdmin as isAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper function to emit real-time updates
const emitToAdmins = (req, event, data) => {
  const io = req.app.get("io");
  if (io) {
    io.to("adminRoom").emit(event, data);
  }
};

/* ---------------------------
    USER/ADMIN MANAGEMENT (UPDATED)
    Routes are relative to /api/admin
--------------------------- */

// GET /api/admin/users - Fetch ALL users (AdminsView will filter for role: 'admin')
router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // FIX: Fetch ALL users, excluding the password field, allowing the frontend to filter by role
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// POST /api/admin/user - Create a new user/admin
router.post("/users", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    const hashedPassword = await hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });
    await newUser.save();

    // Emit real-time update to all admins
    emitToAdmins(req, "user_updated", {
      action: "created",
      userId: newUser._id,
      userName: newUser.name,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error creating user" });
  }
});

// PUT /api/admin/users/:id - Update an existing user/admin (NEW ROUTE ADDED)
router.put("/users/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updateFields = { name, email, role };

    if (password) {
      updateFields.password = await hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Emit real-time update to all admins
    emitToAdmins(req, "user_updated", {
      action: "updated",
      user: updatedUser,
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error updating user" });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete("/users/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found." });

    // Emit real-time update to all admins
    emitToAdmins(req, "user_updated", {
      action: "deleted",
      userId: req.params.id,
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

/* ---------------------------------
    KNOWLEDGE BASE MANAGEMENT - DUAL ROUTES (UNMODIFIED)
// ... (rest of the /knowledge, /faqs, and /stats routes) ...
--------------------------------- */

// GET /api/admin/knowledge - Fetch all Knowledge articles
router.get("/knowledge", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const articles = await Knowledge.find({
      $or: [{ type: { $exists: false } }, { type: "knowledge" }],
    }).sort({ updatedAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error("Error fetching knowledge articles:", err);
    res
      .status(500)
      .json({ message: "Server error fetching knowledge articles" });
  }
});

// POST /api/admin/knowledge - Create a new Knowledge article
router.post("/knowledge", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Missing required fields: title and content." });
    }

    const newArticle = new Knowledge({
      question: title,
      answer: content,
      type: "knowledge",
      source: "Admin Panel",
    });
    const savedArticle = await newArticle.save();

    // Emit real-time update to all admins
    emitToAdmins(req, "knowledge_updated", {
      action: "created",
      article: savedArticle,
    });

    res.status(201).json(savedArticle);
  } catch (err) {
    console.error("Error creating article:", err);
    res.status(500).json({ message: "Server error creating article" });
  }
});

// PUT /api/admin/knowledge/:id - Update an existing Knowledge article
router.put("/knowledge/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;

    const updatedArticle = await Knowledge.findByIdAndUpdate(
      req.params.id,
      { question: title, answer: content, type: "knowledge" },
      { new: true, runValidators: true },
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found." });
    }

    // Emit real-time update to all admins
    emitToAdmins(req, "knowledge_updated", {
      action: "updated",
      article: updatedArticle,
    });

    res.json(updatedArticle);
  } catch (err) {
    console.error("Error updating article:", err);
    res.status(500).json({ message: "Server error updating article" });
  }
});

// DELETE /api/admin/knowledge/:id - Delete an article
router.delete("/knowledge/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const deletedArticle = await Knowledge.findByIdAndDelete(req.params.id);

    if (!deletedArticle) {
      return res.status(404).json({ message: "Article not found." });
    }

    // Emit real-time update to all admins
    emitToAdmins(req, "knowledge_updated", {
      action: "deleted",
      articleId: req.params.id,
    });

    res.json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error("Error deleting article:", err);
    res.status(500).json({ message: "Server error deleting article" });
  }
});

// --- 2. /api/admin/faqs Routes (Directly using question/answer) ---

// GET /api/admin/faqs - Fetch all FAQs (Restored to fix FaqsView 404)
router.get("/faqs", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const faqs = await Knowledge.find({ type: "faq" }).sort({ updatedAt: -1 });
    res.json(faqs);
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    res.status(500).json({ message: "Server error fetching FAQs" });
  }
});

// POST /api/admin/faqs - Create a new FAQ
router.post("/faqs", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // FaqsView sends 'question' and 'answer'
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: "Missing required fields: question and answer." });
    }

    console.log(
      "POST /api/admin/faqs body:",
      req.body,
      "by user:",
      req.user && req.user.id ? req.user.id : req.user,
    );
    const newFaq = new Knowledge({
      question,
      answer,
      source: "Admin Panel",
      type: "faq",
    });
    const savedFaq = await newFaq.save();

    // Emit real-time update to all admins
    emitToAdmins(req, "faq_updated", {
      action: "created",
      faq: savedFaq,
    });

    res.status(201).json(savedFaq);
  } catch (err) {
    console.error(
      "Error creating FAQ:",
      err && err.message ? err.message : err,
    );
    if (err && err.stack) console.error(err.stack);
    // Return error message to help frontend debugging (dev only)
    res.status(500).json({
      message: "Server error creating FAQ",
      error: err && err.message ? err.message : "Unknown error",
    });
  }
});

// PUT /api/admin/faqs/:id - Update an existing FAQ
router.put("/faqs/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { question, answer } = req.body;

    const updatedFaq = await Knowledge.findByIdAndUpdate(
      req.params.id,
      { question, answer, type: "faq" },
      { new: true, runValidators: true },
    );

    if (!updatedFaq) {
      return res.status(404).json({ message: "FAQ not found." });
    }

    // Emit real-time update to all admins
    emitToAdmins(req, "faq_updated", {
      action: "updated",
      faq: updatedFaq,
    });

    res.json(updatedFaq);
  } catch (err) {
    console.error("Error updating FAQ:", err);
    res.status(500).json({ message: "Server error updating FAQ" });
  }
});

// DELETE /api/admin/faqs/:id - Delete an FAQ
router.delete("/faqs/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const deletedFaq = await Knowledge.findByIdAndDelete(req.params.id);

    if (!deletedFaq) {
      return res.status(404).json({ message: "FAQ not found." });
    }

    // Emit real-time update to all admins
    emitToAdmins(req, "faq_updated", {
      action: "deleted",
      faqId: req.params.id,
    });

    res.json({ message: "FAQ deleted successfully" });
  } catch (err) {
    console.error("Error deleting FAQ:", err);
    res.status(500).json({ message: "Server error deleting FAQ" });
  }
});

/* ---------------------------
    ANALYTICS ENDPOINTS (UPDATED)
--------------------------- */

// GET /api/admin/stats - Fetch general statistics
router.get("/stats", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      totalUsers,
      adminUsers,
      totalChats,
      knowledgeArticles,
      faqArticles,
      recentChats,
      dailyCounts,
      responseSamples,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      Chat.countDocuments(),
      Knowledge.countDocuments({
        $or: [{ type: { $exists: false } }, { type: "knowledge" }],
      }),
      Knowledge.countDocuments({ type: "faq" }),
      Chat.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("userId", "name email"),
      Chat.aggregate([
        { $match: { updatedAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$updatedAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Chat.find().select("messages").limit(50),
    ]);

    const daySequence = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      daySequence.push(date.toISOString().split("T")[0]);
    }

    const dailyMap = dailyCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const conversationsLast7Days = daySequence.map((date) => ({
      date,
      count: dailyMap[date] || 0,
    }));

    let responseTime = 1.8;
    let totalLagMs = 0;
    let lagSamples = 0;
    responseSamples.forEach((chat) => {
      for (let i = 0; i < chat.messages.length - 1; i++) {
        const current = chat.messages[i];
        if (current.role !== "user") continue;
        const nextAssistant = chat.messages
          .slice(i + 1)
          .find((m) => m.role === "assistant");
        if (!nextAssistant) continue;
        const diff =
          new Date(nextAssistant.timestamp).getTime() -
          new Date(current.timestamp).getTime();
        if (diff >= 0) {
          totalLagMs += diff;
          lagSamples += 1;
        }
      }
    });
    if (lagSamples > 0) {
      responseTime = Number((totalLagMs / lagSamples / 1000).toFixed(2));
    }

    const recentActivity = recentChats.map((chat) => ({
      id: chat._id,
      user: chat.userId?.name || chat.userId?.email || "Guest user",
      action:
        chat.messages?.[chat.messages.length - 1]?.role === "assistant"
          ? "Assistant responded"
          : "User asked a question",
      time: chat.updatedAt,
    }));

    res.json({
      users: totalUsers,
      admins: adminUsers,
      conversations: totalChats,
      knowledgeArticles,
      faqs: faqArticles,
      responseTime,
      charts: {
        conversationsLast7Days,
      },
      recentActivity,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error fetching analytics data" });
  }
});

/* ---------------------------
    CONVERSATIONS ENDPOINTS
--------------------------- */

// GET /api/admin/conversations - Fetch all conversations
router.get("/conversations", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const conversations = await Chat.find()
      .populate("userId", "name email")
      .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map((chat) => ({
      _id: chat._id,
      user: {
        id: chat.userId?._id,
        name: chat.userId?.name || "Unknown User",
        email: chat.userId?.email || "",
      },
      messageCount: chat.messages?.length || 0,
      lastMessage:
        chat.messages && chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1].text
          : "No messages",
      status: chat.status || "active",
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages || [],
    }));

    res.json(formattedConversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ message: "Server error fetching conversations" });
  }
});

// GET /api/admin/conversations/:id - Get a specific conversation
router.get("/conversations/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const conversation = await Chat.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    res.json({
      _id: conversation._id,
      user: {
        id: conversation.userId?._id,
        name: conversation.userId?.name || "Unknown User",
        email: conversation.userId?.email || "",
      },
      messages: conversation.messages || [],
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ message: "Server error fetching conversation" });
  }
});

// DELETE /api/admin/conversations/:id - Delete a conversation
router.delete(
  "/conversations/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const deletedConversation = await Chat.findByIdAndDelete(req.params.id);

      if (!deletedConversation) {
        return res.status(404).json({ message: "Conversation not found." });
      }

      // Emit real-time update to all admins
      emitToAdmins(req, "conversation_deleted", {
        conversationId: req.params.id,
      });

      res.json({ message: "Conversation deleted successfully" });
    } catch (err) {
      console.error("Error deleting conversation:", err);
      res.status(500).json({ message: "Server error deleting conversation" });
    }
  },
);

export default router;
