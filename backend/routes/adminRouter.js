import express from 'express';
import FAQ from '../models/FAQ.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

const router = express.Router();

// --- Helper function for fetching stats ---
const getYesterday = () => new Date(Date.now() - 24 * 60 * 60 * 1000);

// 1. Dashboard Metrics and Charts Fetching
// GET /api/admin/metrics
router.get('/metrics', async (req, res) => {
    try {
        const yesterday = getYesterday();

        // Mongoose Queries for Metrics
        const chatsToday = await Conversation.countDocuments({
            createdAt: { $gte: yesterday }
        });
        
        const totalUsers = await User.countDocuments();

        const activeUsersToday = await User.countDocuments({
            lastLogin: { $gte: yesterday }
        });

        // Mongoose Aggregation for Chart Data (Chats over the last 14 days)
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        const chatsOverTime = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: twoWeeksAgo }
                }
            },
            {
                $group: {
                    // Group by date (YYYY-MM-DD)
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort by date ascending
        ]);
        
        // Mocked non-database metrics (as these usually require external logging)
        const avgResponseMs = 345; 
        const accuracyPct = 92;

        res.json({
            metrics: {
                chatsToday: chatsToday,
                totalUsers: totalUsers,
                activeUsersToday: activeUsersToday,
                avgResponseMs: avgResponseMs, 
                accuracyPct: accuracyPct
            },
            // Format data for the front-end chart
            chatsOverTime: chatsOverTime.map(d => ({ date: d._id, count: d.count })),
            // Static mock data for example chart requiring two weeks of data
            accuracyOverTime: [85, 87, 88, 90, 91, 92, 90, 93, 94, 95, 92, 93, 91, 92], 
        });

    } catch (error) {
        console.error('MongoDB Metrics Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
});


// 2. Fetch All Conversations (Snippet View)
// GET /api/admin/conversations
router.get('/conversations', async (req, res) => {
    try {
        // Fetch most recent conversations, only selecting necessary fields for the list view
        const conversations = await Conversation.find()
            .select('user_name snippet createdAt isUnread') 
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json(conversations);
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
