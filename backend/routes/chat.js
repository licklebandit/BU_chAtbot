// backend/routes/chat.js
import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
// ✅ NEW: Import multer for handling file uploads
import multer from "multer"; 

import Chat from "../models/Chat.js";
import User from "../models/User.js";

import { searchKnowledge } from "../utils/searchKnowledge.js";
import { getChatResponse } from "../utils/getChatResponse.js";
import { webSearch } from "../utils/webSearch.js";
import Knowledge from "../models/Knowledge.js";
import {
  classifyIntent,
  getIntentPriority,
  getSuggestedQuestions,
} from "../utils/intentClassifier.js";

const router = express.Router();

// ---------------------------
// Setup __filename and __dirname for ES Modules
// ---------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------
// Multer configuration for image uploads
// ---------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ Use the correct path relative to the project root (assuming chat.js is in routes/)
    // The server.js already configured /uploads to be static, so we just need the local path.
    const uploadDir = path.join(__dirname, '..', 'uploads'); 
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Use the original extension
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); 
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ---------------------------
// Load knowledge base JSON (Unchanged)
// ---------------------------
const knowledgePath = path.resolve(__dirname, "../data/knowledge.json");
let knowledgeBase = [];

const loadKnowledgeBase = () => {
  if (!fs.existsSync(knowledgePath)) {
    console.warn("⚠️ knowledge.json not found. Chat context will be empty.");
    knowledgeBase = [];
    return;
  }

  try {
    const fileData = fs.readFileSync(knowledgePath, "utf8");
    knowledgeBase = JSON.parse(fileData);
    console.log(
      `✅ Loaded ${knowledgeBase.length} knowledge items from knowledge.json`,
    );
  } catch (error) {
    console.error("⚠️ Error parsing knowledge.json:", error);
    knowledgeBase = [];
  }
};

loadKnowledgeBase();

try {
  fs.watchFile(knowledgePath, { interval: 5000 }, () => {
    console.log("♻️ Detected knowledge.json change. Reloading...");
    loadKnowledgeBase();
  });
} catch (watchErr) {
  console.warn(
    "⚠️ Failed to watch knowledge.json for changes:",
    watchErr.message || watchErr,
  );
}

// ---------------------------
// Middleware: Authenticate (Unchanged)
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
// Image Upload Route (Unchanged, looks correct)
// ---------------------------
router.post('/upload-image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Create URL for the uploaded file
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// ---------------------------
// Main Chat Route (Unchanged Logic - already correctly handles `imageUrl`)
// ---------------------------
router.post("/", authenticate, async (req, res) => {
  console.log("📨 Chat request received");
  const { q, imageUrl } = req.body;
  if ((!q || q.trim() === "") && !imageUrl) {
    return res.status(400).json({ answer: "Please ask a valid question or provide an image." });
  }
  // ... (rest of the route logic is unchanged and looks correct) ...
  try {
    console.log(`❓ Question: "${q}"`);

    // 1️⃣ Classify intent for analytics and routing
    const { intent, confidence } = classifyIntent(q);
    const priority = getIntentPriority(intent);
    console.log(
      `🎯 Intent: ${intent} (confidence: ${confidence}, priority: ${priority})`,
    );

    // 2️⃣ Search knowledge base for context
    let context = "";
    try {
      // Load dynamic knowledge from DB and merge with static JSON file
      let dbKnowledge = [];
      try {
        const rawDbKnowledge = await Knowledge.find().lean();
        // Map database knowledge to match JSON format (question -> keyword for compatibility)
        dbKnowledge = rawDbKnowledge.map((item) => ({
          keyword: item.question || item.keyword || "",
          answer: item.answer || "",
          question: item.question || "",
          title: item.title || item.question || "",
          ...item, // Include all other fields
        }));
      } catch (dbErr) {
        console.warn(
          "Could not load knowledge from DB:",
          dbErr.message || dbErr,
        );
        dbKnowledge = [];
      }

      // Map JSON knowledge to ensure consistent format
      const mappedJsonKnowledge = Array.isArray(knowledgeBase)
        ? knowledgeBase.map((item) => ({
            keyword: item.keyword || item.question || "",
            answer: item.answer || "",
            question: item.question || item.keyword || "",
            ...item,
          }))
        : [];

      const mergedKnowledge = [...mappedJsonKnowledge, ...dbKnowledge];
      console.log(
        `🔁 mergedKnowledge counts: file=${mappedJsonKnowledge.length} db=${dbKnowledge.length} total=${mergedKnowledge.length}`,
      );
      context = await searchKnowledge(q, mergedKnowledge);
      console.log(`📚 Context: ${context ? "FOUND" : "NOT FOUND"}`);
    } catch (searchErr) {
      console.error(
        "❌ searchKnowledge failed:",
        searchErr && searchErr.message ? searchErr.message : searchErr,
      );
      context = ""; // Fall through with empty context
    }

    // 3️⃣ Knowledge-first + RAG behavior (configurable)
    // RAG_MODE options:
    // - kb-only : return KB content directly
    // - refine  : send KB context to LLM to produce a polished answer (default)
    // - llm-only: always call LLM (ignore KB)
    const RAG_MODE = (process.env.RAG_MODE || "refine").toLowerCase();

    let answer = "";

    // Helper to call GenAI with optional context (KB or web results)
    const callLLM = async (question, contextStr = "") => {
      try {
        console.log(`🤖 Calling GenAI (RAG_MODE=${RAG_MODE})...`);
        const { text: aiResponse } = await getChatResponse(
          question,
          contextStr,
          imageUrl,
        );
        console.log("✅ GenAI response received");
        return aiResponse;
      } catch (genaiErr) {
        console.error(
          "❌ GenAI call failed:",
          genaiErr && genaiErr.message ? genaiErr.message : genaiErr,
        );
        return null;
      }
    };

    if (RAG_MODE === "llm-only") {
      // Always use LLM (no KB short-circuit)
      const llm = await callLLM(q, "");
      answer =
        llm ||
        "I couldn't generate an answer right now. Please try again later.";
    } else if (context && typeof context === "string" && context.trim()) {
      // KB hit
      if (RAG_MODE === "kb-only") {
        answer = context;
        console.log("✅ Returning KB answer (kb-only mode)");
      } else {
        // kb-first refinement: send KB context to LLM to produce a natural reply
        const refined = await callLLM(q, context);
        answer = refined || context; // fallback to raw KB if LLM fails
        console.log("✅ Responding with refined KB/LLM answer");
      }
    } else {
      // No KB match — optionally do a web search to gather context, then call LLM
      let webContext = "";
      if (process.env.WEB_SEARCH === "true") {
        try {
          const results = await webSearch(q);
          if (Array.isArray(results) && results.length)
            webContext = results.join("\n\n");
        } catch (wsErr) {
          console.warn(
            "Web search failed:",
            wsErr && wsErr.message ? wsErr.message : wsErr,
          );
        }
      }

      const llm = await callLLM(q, webContext);
      answer =
        llm ||
        "I don't have information about that in my knowledge base. Please try asking a different question or contact support.";
    }

    // 4️⃣ Get suggested follow-up questions based on intent
    const suggestedQuestions = getSuggestedQuestions(intent);

    // 5️⃣ Save chat if user is logged in
    if (req.user) {
      let chat = await Chat.findOne({ userId: req.user._id });
      if (!chat) chat = new Chat({ userId: req.user._id, messages: [] });

      const userMessage = {
        role: "user",
        text: q,
        intent: intent,
        confidence: confidence,
      };
      if (imageUrl) {
        userMessage.image = imageUrl;
      }
      chat.messages.push(userMessage);
      chat.messages.push({
        role: "assistant",
        text: answer,
        intent: intent,
        confidence: confidence,
      });
      chat.isUnread = true;
      chat.priority = priority;

      // Update session data
      if (!chat.sessionData) {
        chat.sessionData = {};
      }
      chat.sessionData.lastActive = new Date();

      await chat.save();

      // 6️⃣ Emit via socket.io
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

    res.json({
      answer,
      intent: intent,
      confidence: confidence,
      suggestedQuestions: suggestedQuestions.slice(0, 3), // Return top 3 suggestions
    });
  } catch (error) {
    console.error("❌ Chat route error:", error);
    res
      .status(500)
      .json({
        answer:
          "Sorry, I couldn't process your request due to an internal server error.",
      });
  }
});

// ---------------------------
// Chat History Route
// ---------------------------
// Quick test endpoint that forces an LLM-only response (useful for testing Gemini)
router.get("/test/llm", async (req, res) => {
  const q = String(req.query.q || "Hello, introduce yourself in one sentence.");
  // Temporarily force llm-only behavior for this request
  const prevMode = process.env.RAG_MODE;
  process.env.RAG_MODE = "llm-only";
  try {
    const { text } = await getChatResponse(q, "");
    res.json({ answer: text });
  } catch (err) {
    console.error(
      "Error in /test/llm:",
      err && err.message ? err.message : err,
    );
    res.status(500).json({ answer: "LLM test failed." });
  } finally {
    process.env.RAG_MODE = prevMode;
  }
});

router.get("/history", authenticate, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(10);
    res.json(chats);
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