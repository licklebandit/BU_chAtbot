// backend/routes/chat.js
import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { GoogleGenAI } from "@google/genai";
import { cosinesim } from "./vectorStore.js"; // Your vector similarity function

const router = express.Router();
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---------------------------
// Load knowledge base JSON
// ---------------------------
const knowledgePath = "./data/knowledge.json"; // make sure this file exists
let knowledgeBase = [];
if (fs.existsSync(knowledgePath)) {
  try {
    knowledgeBase = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
  } catch (error) {
    console.error("⚠️ Failed to parse knowledge.json:", error);
  }
} else {
  console.warn("⚠️ knowledge.json not found. Chat context will be empty.");
}

// ---------------------------
// Middleware: Authenticate
// ---------------------------
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

// ---------------------------
// Knowledge Search Function
// ---------------------------
async function searchKnowledge(question, knowledgeBase) {
  if (!knowledgeBase || knowledgeBase.length === 0) return "";

  // Sort knowledge by cosine similarity
  const relevantKnowledge = knowledgeBase
    .map(item => ({
      ...item,
      similarity: cosinesim(question.toLowerCase(), item.keyword.toLowerCase())
    }))
    .filter(item => item.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  if (relevantKnowledge.length === 0) return "";

  // Combine top 3 results as context
  const context = relevantKnowledge
    .map(item => `${item.keyword}: ${item.answer}`)
    .join("\n\n");

  return context;
}

// ---------------------------
// Chat Response Function
// ---------------------------
async function getChatResponse(question, context) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const basePrompt = `You are Bugema University's AI assistant. Be polite, helpful, and accurate. 
If you have relevant information in the context, use it to answer the question.
If you don't have relevant information, say so and provide a general response.

Context:
${context || "No specific context available for this question."}

Question: ${question}`;

  const result = await model.generateContent(basePrompt);
  const response = await result.response;
  return response.text();
}

// ---------------------------
// Main Chat Route
// ---------------------------
router.post("/", authenticate, async (req, res) => {
  const { q } = req.body;
  if (!q || q.trim() === "") {
    return res.status(400).json({ answer: "Please ask a valid question." });
  }

  try {
    // 1️⃣ Search knowledge base for context
    const context = await searchKnowledge(q, knowledgeBase);

    // 2️⃣ Generate AI answer
    const aiResponse = await getChatResponse(q, context);
    const answer = aiResponse || "I’m not sure about that. Can you ask differently?";

    // 3️⃣ Save chat if user is logged in
    if (req.user) {
      let chat = await Chat.findOne({ userId: req.user._id });
      if (!chat) chat = new Chat({ userId: req.user._id, messages: [] });

      chat.messages.push({ role: "user", text: q });
      chat.messages.push({ role: "assistant", text: answer });
      await chat.save();

      // 4️⃣ Emit via socket.io
      const io = req.app.get("io");
      if (io) {
        io.emit("new_conversation", {
          id: chat._id,
          user_name: req.user.name || req.user.email || "Unknown",
          snippet: q,
          createdAt: new Date(),
        });

        // Emit metrics
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

// ---------------------------
// Chat History Route
// ---------------------------
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

// ---------------------------
// Clear Chat History
// ---------------------------
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
