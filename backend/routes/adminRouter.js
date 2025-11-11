// backend/routes/adminRouter.js

import express from "express";
import User from "../models/User.js"; 
import Conversation from "../models/Conversation.js"; 
import Knowledge from "../models/Knowledge.js"; // Assumes this handles your FAQ/KB items
import { hash } from 'bcrypt'; 
import { verifyUser as isAuthenticated, verifyAdmin as isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------------------
    USER/ADMIN MANAGEMENT (Placeholders from previous steps)
--------------------------- */

// GET /api/admin/users
router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error fetching users" });
    }
});

// POST /api/admin/user
router.post("/user", isAuthenticated, isAdmin, async (req, res) => {
    try {
        // TODO: Implement user creation logic
        res.status(201).json({ message: "User created successfully (Placeholder)" });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Server error creating user" });
    }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User not found." });
        res.json({ message: "User deleted successfully (Placeholder)" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Server error deleting user" });
    }
});

/* ---------------------------------
    KNOWLEDGE MANAGEMENT (Corrected to use /knowledge routes)
    Routes are relative to /api/admin/knowledge
--------------------------------- */

// GET /api/admin/knowledge - Fetch all Knowledge articles
router.get("/knowledge", isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Fetches articles using fields expected by KnowledgeView (title/content)
        const articles = await Knowledge.find().sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        console.error("Error fetching knowledge articles:", err);
        res.status(500).json({ message: "Server error fetching knowledge articles" });
    }
});

// POST /api/admin/knowledge - Create a new Knowledge article
router.post("/knowledge", isAuthenticated, isAdmin, async (req, res) => {
    try {
        // KnowledgeModal sends 'title' and 'content'
        const { title, content } = req.body; 
        
        if (!title || !content) {
            return res.status(400).json({ message: "Missing required fields: title and content." });
        }

        // Assuming your Knowledge model supports 'title' and 'content' fields
        const newArticle = new Knowledge({ title, content, source: 'Admin Panel' });
        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (err) {
        console.error("Error creating article:", err);
        res.status(500).json({ message: "Server error creating article" });
    }
});

// PUT /api/admin/knowledge/:id - Update an existing Knowledge article
router.put("/knowledge/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { title, content } = req.body;
        
        const updatedArticle = await Knowledge.findByIdAndUpdate(
            req.params.id,
            { title, content }, 
            { new: true, runValidators: true }
        );

        if (!updatedArticle) {
            return res.status(404).json({ message: "Article not found." });
        }

        res.json(updatedArticle);
    } catch (err) {
        console.error("Error updating article:", err);
        res.status(500).json({ message: "Server error updating article" });
    }
});

// DELETE /api/admin/knowledge/:id - Delete an article
router.delete("/knowledge/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const deletedArticle = await Knowledge.findByIdAndDelete(req.params.id);

        if (!deletedArticle) {
            return res.status(404).json({ message: "Article not found." });
        }

        res.json({ message: "Article deleted successfully" });
    } catch (err) {
        console.error("Error deleting article:", err);
        res.status(500).json({ message: "Server error deleting article" });
    }
});

/* ---------------------------
    ANALYTICS ENDPOINTS (Placeholder from previous steps)
--------------------------- */

// GET /api/admin/stats - Fetch general statistics 
router.get("/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalConversations = await Conversation.countDocuments();
        const totalKnowledgeArticles = await Knowledge.countDocuments();

        res.json({ 
            totalUsers, 
            totalConversations,
            totalKnowledgeArticles
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ message: "Server error fetching stats" });
    }
});


export default router;