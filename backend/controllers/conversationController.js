import Conversation from '../models/Conversation.js';

export const getConversationStats = async (req, res) => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // Get total conversations count
        const totalConversations = await Conversation.countDocuments();

        // Get recent conversations counts
        const last24Hours = await Conversation.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } });
        const lastWeek = await Conversation.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const lastMonth = await Conversation.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        // Get daily conversation counts for the last 7 days
        const dailyCounts = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get hourly counts for the last 24 hours
        const hourlyCounts = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: twentyFourHoursAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get average messages per conversation
        const messageStats = await Conversation.aggregate([
            {
                $project: {
                    messageCount: { $size: "$transcript" }
                }
            },
            {
                $group: {
                    _id: null,
                    avgMessages: { $avg: "$messageCount" },
                    maxMessages: { $max: "$messageCount" }
                }
            }
        ]);

        res.json({
            total: totalConversations,
            recent: {
                last24Hours,
                lastWeek,
                lastMonth
            },
            dailyCounts,
            hourlyCounts,
            messageStats: messageStats[0] || { avgMessages: 0, maxMessages: 0 }
        });

    } catch (error) {
        console.error('Error getting conversation stats:', error);
        res.status(500).json({ message: 'Failed to get conversation statistics' });
    }
};