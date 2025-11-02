import express from 'express';
import { verifyAdmin } from '../middleware/authMiddleware.js';
import { getConversationStats } from '../controllers/conversationController.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

// Get conversation statistics
router.get('/stats', verifyAdmin, getConversationStats);

// Get recent conversations
router.get('/recent', verifyAdmin, async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .select('userId user_name snippet transcript createdAt isUnread');
        res.json(conversations);
    } catch (error) {
        console.error('Error getting recent conversations:', error);
        res.status(500).json({ message: 'Failed to get recent conversations' });
    }
});

// Get user's recent conversations
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

// Mark conversation as read
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