import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

import Chat from "../models/Chat.js";
import User from "../models/User.js";

// Ensure these paths are correct relative to your project structure
import { searchKnowledge } from "../utils/searchKnowledge.js";
import { getChatResponse } from "../utils/getChatResponse.js";

const router = express.Router();

// -----------------
// Load knowledge.json as fallback
// -----------------
const knowledgePath = path.resolve("data/knowledge.json");
let knowledge = [];
if (fs.existsSync(knowledgePath)) {
  try {
    knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
    console.log(`✅ Loaded ${knowledge.length} knowledge items`);
  } catch (err) {
    console.error("⚠️ Error parsing knowledge.json:", err);
  }
} else {
  console.warn("⚠️ knowledge.json not found. Fallback search will be limited.");
}

// -----------------
// Auth Middleware
// -----------------
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Assuming User model is available and working
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

  if (!q || q.trim() === "") {
    return res.status(400).json({ answer: "Please ask a valid question." });
  }

  try {
    // 1️⃣ Get context from vector store + fallback knowledge.json
    
        // Attempt to build context from vector store + fallback knowledge.json
        let context = "";
        try {
            context = await searchKnowledge(q, knowledge);
            if (!context) {
                // fallback to naive match in knowledge.json if searchKnowledge returned empty
                const fallback = knowledge.find(item => q.toLowerCase().includes((item.question || item.keyword || '').toLowerCase()));
                if (fallback) context = `${fallback.answer || ''}`;
            }
        } catch (searchErr) {
            console.error('searchKnowledge failed:', searchErr);
            // keep going with empty context so chatbot still responds
            context = "";
        }

        // 2️⃣ Knowledge-first behavior: if we found relevant KB context, return it as the answer
        // This avoids making an LLM call when an authoritative KB answer exists.
        let answer = "";
        if (context && typeof context === 'string' && context.trim()) {
            // Prefer the KB content directly. You can change this to refine with the LLM
            // by setting a flag or calling getChatResponse(context, q) instead.
            answer = `According to our knowledge base:\n\n${context}`;
            console.log('Responding from knowledge base (knowledge-first).');
        } else {
            // No KB context found — fall back to LLM
            const { text: llmAnswer } = await getChatResponse(q, context);
            answer = llmAnswer;
        }

    // 3️⃣ Save chat if user is logged in
    if (req.user) {
      // Find or create a new chat document for the user
      let chat = await Chat.findOne({ userId: req.user._id });
      if (!chat) chat = new Chat({ userId: req.user._id, messages: [] });

      chat.messages.push({ role: "user", text: q });
      chat.messages.push({ role: "assistant", text: answer });
      await chat.save();

      // 4️⃣ Emit real-time update to connected clients (If using Socket.IO)
      const io = req.app.get("io");
      if (io) {
        io.emit("new_conversation", {
          id: chat._id,
          user_name: req.user.name || req.user.email || "Unknown",
          snippet: q,
          createdAt: new Date(),
        });
      }
    }

    res.json({ answer });
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({ answer: "Sorry, I couldn’t process your request right now." });
  }
});

// -----------------
// Chat History Route
// -----------------
router.get("/history", authenticate, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  try {
    // The frontend expects an array of chat objects, not just the messages array.
    const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(5); 
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history." });
  }
});

// -----------------
// Clear Chat History Route
// -----------------
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