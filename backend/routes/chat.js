import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();
const ai = new GoogleGenAI({});

const knowledgePath = "./data/knowledge.json";
let knowledge = [];
if (fs.existsSync(knowledgePath)) {
  try {
    knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
  } catch (error) {
    console.error("⚠️ Error parsing knowledge.json:", error);
  }
} else {
  console.warn("⚠️ knowledge.json not found.");
}

// ✅ Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("_id name email");
  } catch (err) {
    console.error("JWT verification failed:", err.message);
  }
  next();
};

// ✅ Main chat route
router.post("/", authenticate, async (req, res) => {
  const { q } = req.body;
  if (!q || q.trim() === "") {
    return res.status(400).json({ answer: "Please ask a valid question." });
  }

  try {
    const context = await searchKnowledge(q, knowledge);
    const response = await getChatResponse(q, context);
    const answer = response.text.trim();

    if (req.user) {
      let chat = await Chat.findOne({ userId: req.user._id });
      if (!chat) chat = new Chat({ userId: req.user._id, messages: [] });

      chat.messages.push({ role: "user", text: q });
      chat.messages.push({ role: "assistant", text: answer });
      await chat.save();

      const io = req.app.get("io");
      if (io) {
        io.emit("new_conversation", {
          id: chat._id,
          user_name: req.user.name || req.user.email || "Unknown",
          snippet: q,
          createdAt: new Date(),
        });

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const chatsToday = await Chat.countDocuments({
          "messages.timestamp": { $gte: yesterday },
        }).catch(() => 0);
        const activeUsersToday = await User.countDocuments({
          lastLogin: { $gte: yesterday },
        }).catch(() => 0);
        io.emit("metrics", { chatsToday, activeUsersToday });
      }
    }

    res.json({ answer });
  } catch (error) {
    console.error("❌ Chat route error:", error);
    res.status(500).json({ answer: "Sorry, I couldn’t process your request right now." });
  }
});

// ✅ Chat history routes
router.get("/history", authenticate, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  try {
    const chat = await Chat.findOne({ userId: req.user._id });
    res.json(chat ? chat.messages : []);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history." });
  }
});

router.delete("/clear", authenticate, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  try {
    await Chat.deleteMany({ userId: req.user._id });
    res.json({ message: "Chat history cleared successfully." });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    res.status(500).json({ message: "Error clearing chat history." });
  }
});

export default router;
