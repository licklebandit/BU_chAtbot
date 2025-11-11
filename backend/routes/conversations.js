import express from 'express';
import { verifyAdmin } from '../middleware/authMiddleware.js';
import { getConversationStats } from '../controllers/conversationController.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

// --- Conversation statistics ---
router.get('/stats', verifyAdmin, getConversationStats);

// --- Get all conversations for admin dashboard ---
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .select('userId user_name snippet transcript createdAt isUnread messages');
        res.json(conversations); // always return an array
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json([]); // fallback: empty array
    }
});

// --- Get recent conversations (optional, can be used elsewhere) ---
router.get('/recent', verifyAdmin, async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .select('userId user_name snippet transcript createdAt isUnread');
        res.json(conversations);
    } catch (error) {
        console.error('Error getting recent conversations:', error);
        res.status(500).json([]);
    }
});

// --- Get single conversation by ID ---
router.get('/:id', verifyAdmin, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .select('userId user_name snippet transcript createdAt isUnread');
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        res.json(conversation);
    } catch (error) {
        console.error('Error getting conversation by ID:', error);
        res.status(500).json({ message: 'Failed to get conversation' });
    }
});

// --- Get user's recent conversations ---
router.get('/user/:userId', async (req, res) => {
    try {
        const conversations = await Conversation.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('snippet transcript createdAt');
        res.json(conversations);
    } catch (error) {
        console.error('Error getting user conversations:', error);
        res.status(500).json({ message: 'Failed to get user conversations' });
    }
});

// --- Mark conversation as read ---
router.put('/:id/read', verifyAdmin, async (req, res) => {
    try {
        const conversation = await Conversation.findByIdAndUpdate(
            req.params.id,
            { isUnread: false },
            { new: true }
        );
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        res.json(conversation);
    } catch (error) {
        console.error('Error marking conversation as read:', error);
        res.status(500).json({ message: 'Failed to mark conversation as read' });
    }
});

export default router;
