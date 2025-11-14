// backend/routes/chat.js
import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";

import Chat from "../models/Chat.js";
import User from "../models/User.js";

import { searchKnowledge } from "../utils/searchKnowledge.js";
import { getChatResponse } from "../utils/getChatResponse.js"; 
import { webSearch } from "../utils/webSearch.js";
import Knowledge from "../models/Knowledge.js";

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
            // Load dynamic knowledge from DB and merge with static JSON file
            let dbKnowledge = [];
            try {
                dbKnowledge = await Knowledge.find().lean();
            } catch (dbErr) {
                console.warn('Could not load knowledge from DB:', dbErr.message || dbErr);
                dbKnowledge = [];
            }

            const mergedKnowledge = Array.isArray(knowledgeBase) ? [...knowledgeBase, ...dbKnowledge] : dbKnowledge;
            context = await searchKnowledge(q, mergedKnowledge);
            console.log(`📚 Context: ${context ? "FOUND" : "NOT FOUND"}`);
        } catch (searchErr) {
            console.error("❌ searchKnowledge failed:", searchErr && searchErr.message ? searchErr.message : searchErr);
            context = ""; // Fall through with empty context
        }

                // 2️⃣ Knowledge-first + RAG behavior (configurable)
                // RAG_MODE options:
                // - kb-only : return KB content directly
                // - refine  : send KB context to LLM to produce a polished answer (default)
                // - llm-only: always call LLM (ignore KB)
                const RAG_MODE = (process.env.RAG_MODE || 'refine').toLowerCase();

                let answer = "";

                // Helper to call GenAI with optional context (KB or web results)
                const callLLM = async (question, contextStr = '') => {
                    try {
                        console.log(`🤖 Calling GenAI (RAG_MODE=${RAG_MODE})...`);
                        const { text: aiResponse } = await getChatResponse(question, contextStr);
                        console.log('✅ GenAI response received');
                        return aiResponse;
                    } catch (genaiErr) {
                        console.error('❌ GenAI call failed:', genaiErr && genaiErr.message ? genaiErr.message : genaiErr);
                        return null;
                    }
                };

                if (RAG_MODE === 'llm-only') {
                    // Always use LLM (no KB short-circuit)
                    const llm = await callLLM(q, '');
                    answer = llm || "I couldn't generate an answer right now. Please try again later.";
                } else if (context && typeof context === 'string' && context.trim()) {
                    // KB hit
                    if (RAG_MODE === 'kb-only') {
                        answer = context;
                        console.log('✅ Returning KB answer (kb-only mode)');
                    } else {
                        // kb-first refinement: send KB context to LLM to produce a natural reply
                        const refined = await callLLM(q, context);
                        answer = refined || context; // fallback to raw KB if LLM fails
                        console.log('✅ Responding with refined KB/LLM answer');
                    }
                } else {
                    // No KB match — optionally do a web search to gather context, then call LLM
                    let webContext = '';
                    if (process.env.WEB_SEARCH === 'true') {
                        try {
                            const results = await webSearch(q);
                            if (Array.isArray(results) && results.length) webContext = results.join('\n\n');
                        } catch (wsErr) {
                            console.warn('Web search failed:', wsErr && wsErr.message ? wsErr.message : wsErr);
                        }
                    }

                    const llm = await callLLM(q, webContext);
                    answer = llm || "I don't have information about that in my knowledge base. Please try asking a different question or contact support.";
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
// Quick test endpoint that forces an LLM-only response (useful for testing Gemini)
router.get('/test/llm', async (req, res) => {
    const q = String(req.query.q || 'Hello, introduce yourself in one sentence.');
    // Temporarily force llm-only behavior for this request
    const prevMode = process.env.RAG_MODE;
    process.env.RAG_MODE = 'llm-only';
    try {
        const { text } = await getChatResponse(q, '');
        res.json({ answer: text });
    } catch (err) {
        console.error('Error in /test/llm:', err && err.message ? err.message : err);
        res.status(500).json({ answer: 'LLM test failed.' });
    } finally {
        process.env.RAG_MODE = prevMode;
    }
});

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