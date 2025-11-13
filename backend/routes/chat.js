import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

import Chat from "../models/Chat.js";
import User from "../models/User.js";

import { searchKnowledge } from "../utils/searchKnowledge.js";
import { getChatResponse } from "../utils/getChatResponse.js";

const router = express.Router();

// -----------------
// Load knowledge.json
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
// Auth Middleware (MOVED UP to resolve ReferenceError)
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

    if (!q || q.trim() === "") {
        return res.status(400).json({ answer: "Please ask a valid question." });
    }

    try {
        // 1️⃣ Get context from vector store + fallback knowledge.json
        let context = "";
        try {
            // This function should return the most relevant context snippet, or an empty string.
            context = await searchKnowledge(q, knowledge);
        } catch (searchErr) {
            console.error('searchKnowledge failed:', searchErr);
            context = ""; // Proceed with empty context if search fails
        }

        // 2️⃣ LLM Synthesis (Always run for conversational answers)
        // We removed the old 'knowledge-first' logic. The LLM now synthesizes
        // the answer based on the context (or lack thereof), ensuring a unique reply.
        const { text: llmAnswer } = await getChatResponse(q, context);
        let answer = llmAnswer;

        // 3️⃣ Save chat if user is logged in
        if (req.user) {
            let chat = await Chat.findOne({ userId: req.user._id });
            if (!chat) chat = new Chat({ userId: req.user._id, messages: [] });

            chat.messages.push({ role: "user", text: q });
            chat.messages.push({ role: "assistant", text: answer });
            await chat.save();
            
            // 4️⃣ Emit real-time update to connected clients
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