// backend/routes/adminRouter.js

import express from "express";
import User from "../models/User.js"; 
import Conversation from "../models/Conversation.js"; 
import Knowledge from "../models/Knowledge.js"; 
import { hash } from 'bcrypt'; 
import { verifyUser as isAuthenticated, verifyAdmin as isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------------------
    USER/ADMIN MANAGEMENT (UPDATED)
    Routes are relative to /api/admin
--------------------------- */

// GET /api/admin/users - Fetch ALL users (AdminsView will filter for role: 'admin')
router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
        // FIX: Fetch ALL users, excluding the password field, allowing the frontend to filter by role
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error fetching users" });
    }
});

// POST /api/admin/user - Create a new user/admin
router.post("/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Note: Your frontend AdminModal enforces role: 'admin'
        const { username, email, password, role } = req.body;
        
        if (!password) {
            return res.status(400).json({ message: "Password is required for new user creation." });
        }
        
        const hashedPassword = await hash(password, 10); 
        
        // Assuming 'username' in your model is where you put 'name' from the frontend modal
        const newUser = new User({ username, email, password: hashedPassword, role: role || 'user' });
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Server error creating user" });
    }
});

// PUT /api/admin/users/:id - Update an existing user/admin (NEW ROUTE ADDED)
router.put("/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const updateFields = { username, email, role };

        if (password) {
            // Only hash and update password if provided
            updateFields.password = await hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from the response

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Server error updating user" });
    }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete("/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User not found." });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Server error deleting user" });
    }
});

/* ---------------------------------
    KNOWLEDGE BASE MANAGEMENT - DUAL ROUTES (UNMODIFIED)
// ... (rest of the /knowledge, /faqs, and /stats routes) ...
--------------------------------- */

// GET /api/admin/knowledge - Fetch all Knowledge articles
router.get("/knowledge", isAuthenticated, isAdmin, async (req, res) => {
    try {
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
        const { title, content } = req.body; 
        
        if (!title || !content) {
            return res.status(400).json({ message: "Missing required fields: title and content." });
        }

        // Map frontend fields (title/content) to model fields (question/answer)
        const newArticle = new Knowledge({ question: title, answer: content, source: 'Admin Panel' });
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
            // Map frontend fields (title/content) to model fields (question/answer)
            { question: title, answer: content }, 
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

// --- 2. /api/admin/faqs Routes (Directly using question/answer) ---

// GET /api/admin/faqs - Fetch all FAQs (Restored to fix FaqsView 404)
router.get("/faqs", isAuthenticated, isAdmin, async (req, res) => {
    try {
        // FaqsView expects 'question' and 'answer' fields (which the model already uses)
        const faqs = await Knowledge.find().sort({ createdAt: -1 });
        res.json(faqs);
    } catch (err) {
        console.error("Error fetching FAQs:", err);
        res.status(500).json({ message: "Server error fetching FAQs" });
    }
});

// POST /api/admin/faqs - Create a new FAQ
router.post("/faqs", isAuthenticated, isAdmin, async (req, res) => {
    try {
        // FaqsView sends 'question' and 'answer'
        const { question, answer } = req.body; 
        
        if (!question || !answer) {
            return res.status(400).json({ message: "Missing required fields: question and answer." });
        }

        const newFaq = new Knowledge({ question, answer, source: 'Admin Panel' });
        const savedFaq = await newFaq.save();
        res.status(201).json(savedFaq);
    } catch (err) {
        console.error("Error creating FAQ:", err);
        res.status(500).json({ message: "Server error creating FAQ" });
    }
});

// PUT /api/admin/faqs/:id - Update an existing FAQ
router.put("/faqs/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { question, answer } = req.body;
        
        const updatedFaq = await Knowledge.findByIdAndUpdate(
            req.params.id,
            { question, answer }, 
            { new: true, runValidators: true }
        );

        if (!updatedFaq) {
            return res.status(404).json({ message: "FAQ not found." });
        }

        res.json(updatedFaq);
    } catch (err) {
        console.error("Error updating FAQ:", err);
        res.status(500).json({ message: "Server error updating FAQ" });
    }
});

// DELETE /api/admin/faqs/:id - Delete an FAQ
router.delete("/faqs/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const deletedFaq = await Knowledge.findByIdAndDelete(req.params.id);

        if (!deletedFaq) {
            return res.status(404).json({ message: "FAQ not found." });
        }

        res.json({ message: "FAQ deleted successfully" });
    } catch (err) {
        console.error("Error deleting FAQ:", err);
        res.status(500).json({ message: "Server error deleting FAQ" });
    }
});


/* ---------------------------
    ANALYTICS ENDPOINTS
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