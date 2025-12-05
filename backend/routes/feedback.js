// backend/routes/feedback.js
import express from "express";
import Feedback from "../models/Feedback.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import { classifyIntent, getIntentPriority } from "../utils/intentClassifier.js"; 

const router = express.Router();

// ---------------------------
// Middleware: Authenticate
// ---------------------------
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("_id name email");
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    req.user = null;
  }
  next();
};

// Admin authentication
const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id name email role");

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// ---------------------------
// POST /api/feedback - Submit feedback/rating
// ---------------------------
router.post("/", authenticate, async (req, res) => {
  try {
    const { messageId, rating, question, answer, comment, category } = req.body;

    if (!messageId || !rating || !question || !answer) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["positive", "negative"].includes(rating)) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    // Auto-classify intent if not provided
    let finalCategory = category;
    if (!finalCategory || finalCategory === "other") {
      const { intent } = classifyIntent(question);
      finalCategory = intent;
    }

    const feedback = new Feedback({
      userId: req.user?._id,
      messageId,
      rating,
      question,
      answer,
      comment: comment || "",
      category: finalCategory,
    });

    await feedback.save();

    // Update the message feedback in Chat collection
    if (req.user) {
      const chat = await Chat.findOne({ userId: req.user._id });
      if (chat) {
        const message = chat.messages.find(
          (msg) => msg._id.toString() === messageId
        );
        if (message) {
          message.feedback = {
            rating,
            comment: comment || "",
            timestamp: new Date(),
          };
          await chat.save();
        }
      }
    }

    // Emit notification to admin via socket.io
    const io = req.app.get("io");
    if (io) {
      io.to("adminRoom").emit("new_feedback", {
        id: feedback._id,
        rating,
        category: finalCategory,
        question: question.substring(0, 100),
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Error submitting feedback" });
  }
});

// ---------------------------
// GET /api/feedback - Get all feedback (Admin only)
// ---------------------------
router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      rating,
      category,
      resolved,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (rating) query.rating = rating;
    if (category) query.category = category;
    if (resolved !== undefined) query.resolved = resolved === "true";

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({
      feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Error fetching feedback" });
  }
});

// ---------------------------
// GET /api/feedback/stats - Get feedback statistics (Admin only)
// ---------------------------
router.get("/stats", authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Feedback.countDocuments(query);
    const positive = await Feedback.countDocuments({ ...query, rating: "positive" });
    const negative = await Feedback.countDocuments({ ...query, rating: "negative" });

    // Category breakdown
    const categoryStats = await Feedback.aggregate([
      { $match: query },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Rating trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStats = await Feedback.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            rating: "$rating",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Satisfaction rate
    const satisfactionRate = total > 0 ? ((positive / total) * 100).toFixed(2) : 0;

    res.json({
      total,
      positive,
      negative,
      satisfactionRate: parseFloat(satisfactionRate),
      categoryBreakdown: categoryStats,
      dailyTrend: dailyStats,
    });
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    res.status(500).json({ message: "Error fetching feedback statistics" });
  }
});

// ---------------------------
// PUT /api/feedback/:id - Update feedback (Admin only)
// ---------------------------
router.put("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { resolved, adminNotes } = req.body;

    const updateData = {};
    if (resolved !== undefined) updateData.resolved = resolved;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const feedback = await Feedback.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("userId", "name email");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ message: "Error updating feedback" });
  }
});

// ---------------------------
// DELETE /api/feedback/:id - Delete feedback (Admin only)
// ---------------------------
router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: "Error deleting feedback" });
  }
});

// ---------------------------
// GET /api/feedback/export/chat/:chatId - Export chat as PDF
// ---------------------------
router.get("/export/chat/:chatId", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user._id,
    }).populate("userId", "name email");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=chat-history-${chatId}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Bugema University Chatbot", { align: "center" })
      .fontSize(16)
      .text("Chat History Export", { align: "center" })
      .moveDown();

    // Add user info
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`User: ${chat.userId?.name || "Unknown"}`)
      .text(`Email: ${chat.userId?.email || "N/A"}`)
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .text(`Total Messages: ${chat.messages.length}`)
      .moveDown();

    // Add divider
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown();

    // Add messages
    chat.messages.forEach((message, index) => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      const role = message.role === "user" ? "You" : "BUchatbot";

      // Check if we need a new page
      if (doc.y > 700) {
        doc.addPage();
      }

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(message.role === "user" ? "#0033A0" : "#333333")
        .text(`${role} - ${timestamp}`, { continued: false })
        .moveDown(0.3);

      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#000000")
        .text(message.text, { align: "left" })
        .moveDown(0.8);

      // Add feedback if available
      if (message.feedback && message.feedback.rating !== "none") {
        doc
          .fontSize(9)
          .font("Helvetica-Oblique")
          .fillColor("#666666")
          .text(
            `Feedback: ${message.feedback.rating === "positive" ? "👍 Helpful" : "👎 Not Helpful"}`,
            { indent: 20 }
          );
        if (message.feedback.comment) {
          doc.text(`Comment: ${message.feedback.comment}`, { indent: 20 });
        }
        doc.moveDown(0.5);
      }

      // Add separator between messages
      if (index < chat.messages.length - 1) {
        doc
          .moveTo(70, doc.y)
          .lineTo(530, doc.y)
          .strokeColor("#CCCCCC")
          .stroke()
          .moveDown(0.5);
      }
    });

    // Add footer
    doc
      .fontSize(8)
      .fillColor("#999999")
      .text(
        `Generated on ${new Date().toLocaleString()} | Bugema University AI Chatbot`,
        50,
        750,
        { align: "center" }
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error exporting chat:", error);
    res.status(500).json({ message: "Error exporting chat history" });
  }
});

// ---------------------------
// GET /api/feedback/export/json/:chatId - Export chat as JSON
// ---------------------------
router.get("/export/json/:chatId", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user._id,
    }).populate("userId", "name email");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Format for export
    const exportData = {
      chatId: chat._id,
      user: {
        name: chat.userId?.name || "Unknown",
        email: chat.userId?.email || "N/A",
      },
      exportDate: new Date().toISOString(),
      totalMessages: chat.messages.length,
      messages: chat.messages.map((msg) => ({
        role: msg.role,
        text: msg.text,
        timestamp: msg.timestamp,
        intent: msg.intent,
        feedback: msg.feedback,
      })),
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=chat-history-${chatId}.json`
    );
    res.json(exportData);
  } catch (error) {
    console.error("Error exporting chat as JSON:", error);
    res.status(500).json({ message: "Error exporting chat history" });
  }
});

// ---------------------------
// GET /api/feedback/export/txt/:chatId - Export chat as TXT
// ---------------------------
router.get("/export/txt/:chatId", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user._id,
    }).populate("userId", "name email");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Format as text
    let txtContent = "========================================\n";
    txtContent += "BUGEMA UNIVERSITY CHATBOT\n";
    txtContent += "Chat History Export\n";
    txtContent += "========================================\n\n";
    txtContent += `User: ${chat.userId?.name || "Unknown"}\n`;
    txtContent += `Email: ${chat.userId?.email || "N/A"}\n`;
    txtContent += `Export Date: ${new Date().toLocaleString()}\n`;
    txtContent += `Total Messages: ${chat.messages.length}\n\n`;
    txtContent += "========================================\n\n";

    chat.messages.forEach((message, index) => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      const role = message.role === "user" ? "YOU" : "BUCHATBOT";

      txtContent += `[${timestamp}] ${role}:\n`;
      txtContent += `${message.text}\n`;

      if (message.feedback && message.feedback.rating !== "none") {
        txtContent += `\nFeedback: ${message.feedback.rating === "positive" ? "Helpful" : "Not Helpful"}\n`;
        if (message.feedback.comment) {
          txtContent += `Comment: ${message.feedback.comment}\n`;
        }
      }

      txtContent += "\n----------------------------------------\n\n";
    });

    txtContent += `\nGenerated on ${new Date().toLocaleString()}\n`;
    txtContent += "Bugema University AI Chatbot\n";

    res.setHeader("Content-Type", "text/plain");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=chat-history-${chatId}.txt`
    );
    res.send(txtContent);
  } catch (error) {
    console.error("Error exporting chat as TXT:", error);
    res.status(500).json({ message: "Error exporting chat history" });
  }
});

export default router;
