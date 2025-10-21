// /backend/routes/chat.js
import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🧩 Load Bugema knowledge base
const knowledgePath = "./data/knowledge.json";
let knowledge = [];
if (fs.existsSync(knowledgePath)) {
  try {
    const fileData = fs.readFileSync(knowledgePath, "utf8");
    knowledge = JSON.parse(fileData);
  } catch (err) {
    console.error("⚠️ Error parsing knowledge.json:", err);
  }
}

// ✅ Middleware: verify token (optional)
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch {
    console.warn("⚠️ Invalid token");
  }
  next();
}

// 🧠 CHAT ROUTE
router.post("/", verifyToken, async (req, res) => {
  const { q } = req.body;
  if (!q?.trim()) return res.status(400).json({ answer: "Please ask a valid question." });

  let user = null;
  if (req.user) user = await User.findById(req.user.id);

  // 🔒 Limit guest users to 3 questions (tracked per IP)
  if (!user && req.ip) {
    const guestFile = "./data/guests.json";
    let guests = {};
    if (fs.existsSync(guestFile)) {
      guests = JSON.parse(fs.readFileSync(guestFile, "utf8"));
    }
    guests[req.ip] = (guests[req.ip] || 0) + 1;
    fs.writeFileSync(guestFile, JSON.stringify(guests, null, 2));

    if (guests[req.ip] > 3) {
      return res.json({
        answer:
          "🔒 You’ve reached your free question limit. Please log in or sign up to continue chatting with Bugema University AI.",
      });
    }
  }

  // 🎯 Search Bugema-specific knowledge base first
  let context = "You are Bugema University’s official AI assistant. Only answer questions about Bugema University — such as admissions, programs, tuition, history, and campus life. Politely decline anything unrelated.";

  const found = knowledge.find(item => q.toLowerCase().includes(item.keyword.toLowerCase()));
  if (found) context += `\nRelevant info: ${found.answer}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: context },
        { role: "user", content: q },
      ],
    });

    const answer = completion.choices[0].message.content.trim();

    // 💾 Save chat history for logged-in user
    if (user) {
      let chat = await Chat.findOne({ userId: user._id });
      if (!chat) {
        chat = new Chat({ userId: user._id, messages: [] });
      }
      chat.messages.push({ role: "user", content: q });
      chat.messages.push({ role: "bot", content: answer });
      await chat.save();
    }

    res.json({ answer });
  } catch (error) {
    console.error("❌ Chat route error:", error);
    res.status(500).json({
      answer: "⚠️ Sorry, I couldn’t process your request at the moment.",
    });
  }
});

export default router;
