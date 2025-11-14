// backend/routes/chat.js
import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";

import Chat from "../models/Chat.js";
import User from "../models/User.js";

import { searchKnowledge } from "../utils/searchKnowledge.js";
import { getChatResponse } from "../utils/getChatResponse.js"; 

const router = express.Router();

// ---------------------------
// Load knowledge base JSON
// ---------------------------
const knowledgePath = path.resolve("data/knowledge.json");
let knowledgeBase = [];
if (fs.existsSync(knowledgePath)) {
    try {
        knowledgeBase = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
        console.log(`✅ Loaded ${knowledgeBase.length} knowledge items`);
    } catch (error) {
        console.error("⚠️ Error parsing knowledge.json:", error);
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
// Main Chat Route
// ---------------------------
router.post("/", authenticate, async (req, res) => {
    console.log("📨 Chat request received");
    const { q } = req.body;
    if (!q || q.trim() === "") {
        return res.status(400).json({ answer: "Please ask a valid question." });
    }

    try {
        console.log(`❓ Question: "${q}"`);
        // 1️⃣ Search knowledge base for context
        let context = "";
        try {
            context = await searchKnowledge(q, knowledgeBase);
            console.log(`📚 Context: ${context ? "FOUND" : "NOT FOUND"}`);
        } catch (searchErr) {
            console.error("❌ searchKnowledge failed:", searchErr.message);
            context = ""; // Fall through with empty context
        }

        // 2️⃣ Knowledge-first behavior: if we found relevant KB context, return it directly
        let answer = "";
        if (context && typeof context === 'string' && context.trim()) {
            // KB has an answer — use it directly (knowledge-first approach)
            answer = context;
            console.log(`✅ Responding from knowledge base`);
        } else {
            // No KB context — try GenAI; if that fails, give a helpful message
            try {
                console.log(`🤖 Calling GenAI...`);
                const { text: aiResponse } = await getChatResponse(q, context);
                answer = aiResponse || "I'm not sure about that. Can you ask differently?";
                console.log(`✅ GenAI response received`);
            } catch (genaiErr) {
                console.error("❌ GenAI call failed:", genaiErr.message);
                answer = "I don't have information about that in my knowledge base. Please try asking a different question or contact support.";
            }
        }
        
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
        res.status(500).json({ answer: "Sorry, I couldn’t process your request due to an internal server error." });
    }
});

// ---------------------------
// Chat History Route
// ---------------------------
router.get("/history", authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    try {
        const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(10); 
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