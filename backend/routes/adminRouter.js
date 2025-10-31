import express from 'express';
import FAQ from '../models/FAQ.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { io } from '../server.js';

const router = express.Router();

// Pagination helper
const getPaginatedResults = async (model, page = 1, limit = 10, query = {}) => {
    const skip = (page - 1) * limit;
    const [results, total] = await Promise.all([
        model.find(query).skip(skip).limit(limit),
        model.countDocuments(query)
    ]);
    return {
        results,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit
        }
    };
};

// --- Helper function for fetching stats ---
const getYesterday = () => new Date(Date.now() - 24 * 60 * 60 * 1000);

// Helper to emit admin updates
const emitAdminUpdate = async () => {
    try {
        const yesterday = getYesterday();
        const [chatsToday, totalUsers, activeUsersToday] = await Promise.all([
            Conversation.countDocuments({ createdAt: { $gte: yesterday } }),
            User.countDocuments(),
            User.countDocuments({ lastLogin: { $gte: yesterday } })
        ]);

        io.to('adminRoom').emit('adminStatsUpdate', {
            chatsToday,
            totalUsers,
            activeUsersToday,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error emitting admin update:', error);
    }
};

// 1. Dashboard Metrics and Charts Fetching
// GET /api/admin/metrics
router.get('/metrics', async (req, res) => {
    try {
        const yesterday = getYesterday();
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        const [chatsToday, totalUsers, activeUsersToday, chatsOverTime] = await Promise.all([
            Conversation.countDocuments({ createdAt: { $gte: yesterday } }),
            User.countDocuments(),
            User.countDocuments({ lastLogin: { $gte: yesterday } }),
            Conversation.aggregate([
                {
                    $match: { createdAt: { $gte: twoWeeksAgo } }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Calculate real avg response time from recent conversations
        const recentConversations = await Conversation.find({
            createdAt: { $gte: yesterday }
        }).select('responseTimes');

        const avgResponseMs = recentConversations.reduce((acc, conv) => {
            const times = conv.responseTimes || [];
            return acc + (times.reduce((sum, time) => sum + time, 0) / (times.length || 1));
        }, 0) / (recentConversations.length || 1);

        const response = {
            metrics: {
                chatsToday,
                totalUsers,
                activeUsersToday,
                avgResponseMs: Math.round(avgResponseMs),
                accuracyPct: 92 // This would ideally come from user feedback or ML metrics
            },
            chatsOverTime: chatsOverTime.map(d => ({ date: d._id, count: d.count })),
            accuracyOverTime: [85, 87, 88, 90, 91, 92, 90, 93, 94, 95, 92, 93, 91, 92],
        };

        // Emit real-time update to admin clients
        io.to('adminRoom').emit('metricsUpdate', response);

        res.json(response);
    } catch (error) {
        console.error('MongoDB Metrics Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
});

// 2. Fetch All Conversations (Snippet View with Pagination)
// GET /api/admin/conversations
router.get('/conversations', async (req, res) => {
    try {
        // Extract and validate pagination params
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10')));
        const search = req.query.search || '';
        const filter = req.query.filter || 'all';

        // Build filter query
        const query = {};
        if (search) {
            query.$or = [
                { user_name: { $regex: search, $options: 'i' } },
                { snippet: { $regex: search, $options: 'i' } }
            ];
        }
        if (filter === 'unread') query.isUnread = true;
        if (req.query.from) {
            const from = new Date(req.query.from);
            if (!isNaN(from)) query.createdAt = { $gte: from };
        }
        if (req.query.to) {
            const to = new Date(req.query.to);
            if (!isNaN(to)) {
                to.setHours(23, 59, 59, 999);
                query.createdAt = { ...(query.createdAt || {}), $lte: to };
            }
        }

        const paginatedResults = await getPaginatedResults(
            Conversation,
            page,
            limit,
            query
        );

        // Transform data for frontend
        const response = {
            conversations: paginatedResults.results.map(conv => ({
                id: conv._id,
                user_name: conv.user_name,
                snippet: conv.snippet,
                createdAt: conv.createdAt,
                isUnread: conv.isUnread
            })),
            pagination: paginatedResults.pagination
        };

        // Emit real-time update to admin clients
        io.to('adminRoom').emit('conversationsUpdate', response);

        res.json(response);
    } catch (error) {
        console.error('Conversations Query Error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations list' });
    }
});


// 3. Fetch Single Conversation Detail (Full Transcript)
// GET /api/admin/conversations/:id
router.get('/conversations/:id', async (req, res) => {
    const convoId = req.params.id;
    try {
        // Find the conversation by MongoDB's unique _id
        const conversation = await Conversation.findById(convoId);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Return the full conversation object including the transcript array
        res.json(conversation); 

    } catch (error) {
        // This catches casting errors if the ID is not a valid MongoDB ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid Conversation ID format.' });
        }
        console.error('Conversation Detail Error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation details' });
    }
});


// 4. Mark Conversation as Read
// PUT /api/admin/conversations/:id/read
router.put('/conversations/:id/read', async (req, res) => {
    const convoId = req.params.id;
    try {
        const updatedConvo = await Conversation.findByIdAndUpdate(
            convoId,
            { isUnread: false },
            { new: true } // Returns the updated document
        );

        if (!updatedConvo) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json({ message: 'Conversation marked as read' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid Conversation ID format.' });
        }
        res.status(500).json({ error: 'Failed to update conversation status' });
    }
});


// 5. Fetch All FAQs
// GET /api/admin/faqs
router.get('/faqs', async (req, res) => {
    try {
        // Fetch all FAQs, sorting them by creation date
        const faqs = await FAQ.find().sort({ createdAt: -1 });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});


// 6. Add a New FAQ
// POST /api/admin/faqs
router.post('/faqs', async (req, res) => {
    const { question, answer } = req.body;
    try {
        // Create a new document. Mongoose handles validation based on schema.
        const newFaq = await FAQ.create({ question, answer });
        res.status(201).json(newFaq);
    } catch (error) {
        console.error('FAQ Creation Error:', error);
        res.status(400).json({ error: 'Failed to add new FAQ. Check required fields.' });
    }
});


// 7. Delete an FAQ
// DELETE /api/admin/faqs/:id
router.delete('/faqs/:id', async (req, res) => {
    const faqId = req.params.id;
    try {
        const result = await FAQ.findByIdAndDelete(faqId);

        if (!result) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.status(204).send(); // Standard response for successful deletion
    } catch (error) {
        if (error.name === 'CastError') {
             return res.status(400).json({ error: 'Invalid FAQ ID format.' });
        }
        res.status(500).json({ error: 'Failed to delete FAQ' });
    }
});


// 8. Fetch All Users
// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password -__v').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users list' });
    }
});


    // 11. Update a user (name, role)
    // PUT /api/admin/users/:id
    router.put('/users/:id', async (req, res) => {
        const userId = req.params.id;
        const { name, role } = req.body;
        try {
            const updated = await User.findByIdAndUpdate(userId, { name, role }, { new: true }).select('-password -__v');
            if (!updated) return res.status(404).json({ error: 'User not found' });
            res.json(updated);
        } catch (error) {
            if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid User ID format.' });
            console.error('Update User Error:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    });

    // 12. Delete a user
    // DELETE /api/admin/users/:id
    router.delete('/users/:id', async (req, res) => {
        const userId = req.params.id;
        try {
            const deleted = await User.findByIdAndDelete(userId);
            if (!deleted) return res.status(404).json({ error: 'User not found' });
            res.status(204).send();
        } catch (error) {
            if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid User ID format.' });
            console.error('Delete User Error:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    });


// 9. Fetch All Admins
// GET /api/admin/admins
router.get('/admins', async (req, res) => {
    try {
        // Query the User collection where the role is 'admin'
        const admins = await User.find({ role: 'admin' }).select('-password -__v').sort({ createdAt: -1 });
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admins list' });
    }
});


// 10. CSV Bulk User Import
// POST /api/admin/users/import
router.post('/users/import', async (req, res) => {
    // Assuming req.body is an array of user objects parsed from the CSV
    const newUsers = req.body; 

    if (!Array.isArray(newUsers) || newUsers.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty user array provided.' });
    }

    try {
        // Mongoose's insertMany is highly efficient for bulk operations
        // Ensure your input array matches the User schema structure (name, email, role, authId)
        const result = await User.insertMany(newUsers, { ordered: false }); 
        
        res.status(201).json({ 
            message: `Successfully imported ${result.length} users.`,
            importedCount: result.length
        });
        
    } catch (error) {
        // Handle bulk insertion errors (e.g., if a duplicate email exists)
        if (error.code === 11000) {
             return res.status(409).json({ error: 'Bulk import failed: Duplicate key error (some emails already exist).' });
        }
        console.error('Bulk Import Error:', error);
        res.status(500).json({ error: 'Failed to perform bulk user import.' });
    }
});


// Export the router using ES module syntax
export default router;
