// backend/routes/chat.js
import express from "express";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

import { searchKnowledge } from "../utils/searchKnowledge.js";
import { getChatResponse } from "../utils/getChatResponse.js";

const router = express.Router();

// -----------------
// Auth Middleware
// -----------------
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

// -----------------
// Chat Route
// -----------------
router.post("/", authenticate, async (req, res) => {
  const { q } = req.body;
  if (!q || q.trim() === "") return res.status(400).json({ answer: "Please ask a valid question." });

  try {
    const context = await searchKnowledge(q);
    const answer = await getChatResponse(q, context);

    // Save chat if user is logged in
    if (req.user) {
      let chat = await Chat.findOne({ userId: req.user._id });
      if (!chat) chat = new Chat({ userId: req.user._id, messages: [] });

      chat.messages.push({ role: "user", text: q });
      chat.messages.push({ role: "assistant", text: answer });
      await chat.save();

      const io = req.app.get("io");
      if (io) io.emit("new_conversation", { id: chat._id, user_name: req.user.name || req.user.email, snippet: q, createdAt: new Date() });
    }

    res.json({ answer });
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({ answer: "Sorry, I couldn’t process your request right now." });
  }
});

// History & Clear Routes remain the same...

export default router;
