// backend/routes/adminRouter.js

import express from "express";
import User from "../models/User.js"; 
import Conversation from "../models/Conversation.js"; 
import Knowledge from "../models/Knowledge.js"; // Assumes this handles your FAQ/KB items
import { hash } from 'bcrypt'; 
import { verifyUser as isAuthenticated, verifyAdmin as isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------------------
    USER/ADMIN MANAGEMENT (Placeholder)
--------------------------- */

// GET /api/admin/users - Fetch all users 
router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error fetching users" });
    }
});

// POST /api/admin/user - Create a new user (Placeholder)
router.post("/user", isAuthenticated, isAdmin, async (req, res) => {
    try {
        // TODO: Implement user creation logic
        res.status(201).json({ message: "User created successfully (Placeholder)" });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Server error creating user" });
    }
});

// DELETE /api/admin/users/:id - Delete a user (Placeholder)
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
    FAQ/KNOWLEDGE MANAGEMENT (Corrected to use /faqs routes)
    Routes are relative to /api/admin/faqs
--------------------------------- */

// GET /api/admin/faqs - Fetch all FAQs (Matches FaqsView.js)
router.get("/faqs", isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Assuming the Knowledge model has fields 'question' and 'answer'
        const faqs = await Knowledge.find().sort({ createdAt: -1 });
        res.json(faqs);
    } catch (err) {
        console.error("Error fetching FAQs:", err);
        res.status(500).json({ message: "Server error fetching FAQs" });
    }
});

// POST /api/admin/faqs - Create a new FAQ (Matches FaqsView.js)
router.post("/faqs", isAuthenticated, isAdmin, async (req, res) => {
    try {
        // FaqModal is expected to send 'question' and 'answer'
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

// PUT /api/admin/faqs/:id - Update an existing FAQ (Matches FaqsView.js)
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

// DELETE /api/admin/faqs/:id - Delete an FAQ (Matches FaqsView.js)
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
    ANALYTICS ENDPOINTS (Placeholder)
--------------------------- */

// GET /api/admin/stats - Fetch general statistics 
router.get("/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalConversations = await Conversation.countDocuments();
        const totalFaqs = await Knowledge.countDocuments();

        res.json({ 
            totalUsers, 
            totalConversations,
            totalFaqs
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ message: "Server error fetching stats" });
    }
});


export default router;