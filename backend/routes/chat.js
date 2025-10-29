import express from "express";
import dotenv from "dotenv";
// ✅ UPDATED: Use the correct Google GenAI SDK package
import { GoogleGenAI } from '@google/genai';
import fs from "fs";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

// ✅ UPDATED: Initialize the GenAI client. It automatically picks up GEMINI_API_KEY from the environment.
const ai = new GoogleGenAI({});

const knowledgePath = "./data/knowledge.json";
let knowledge = [];
if (fs.existsSync(knowledgePath)) {
  const fileData = fs.readFileSync(knowledgePath, "utf8");
  try {
    knowledge = JSON.parse(fileData);
  } catch (error) {
    console.error("⚠️ Error parsing knowledge.json:", error);
  }
} else {
  console.warn("⚠️ knowledge.json not found.");
}

// ✅ Middleware to verify JWT
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(); // guest mode

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("_id name email");
  } catch (err) {
    console.error("JWT verification failed:", err.message);
  }
  next();
};

// ✅ Chat endpoint
router.post("/", authenticate, async (req, res) => {
  const { q } = req.body;
  if (!q || q.trim() === "") {
    return res.status(400).json({ answer: "Please ask a valid question." });
  }

  let context = "You are Bugema University’s AI assistant. Be polite, helpful, and accurate.";
  const found = knowledge.find(item =>
    q.toLowerCase().includes(item.keyword.toLowerCase())
  );
  if (found) context += `\nRelevant info: ${found.answer}`;

  try {
    // ✅ UPDATED: Switched from OpenAI completion to Gemini generateContent
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Switched from gpt-4o-mini to Gemini's fast model
      contents: [{ role: "user", parts: [{ text: q }] }], // Only the user query here
      config: {
          // Use systemInstruction for the persona and context
          systemInstruction: context, 
      },
    });

    // ✅ UPDATED: Simplified response parsing for Gemini SDK
    const answer = response.text.trim();

    // ✅ Save chat history if user is logged in
    if (req.user) {
      let chat = await Chat.findOne({ userId: req.user._id });
      if (!chat) chat = new Chat({ userId: req.user._id, messages: [] });

      chat.messages.push({ role: "user", text: q });
      chat.messages.push({ role: "assistant", text: answer });
      await chat.save();
    }

    res.json({ answer });
  } catch (error) {
    console.error("❌ Chat route error:", error);
    res.status(500).json({
      answer: "Sorry, I couldn’t process your request right now.",
    });
  }
});

// ✅ Get chat history (for logged-in users)
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

// ✅ Clear chat history (for logged-in users)
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