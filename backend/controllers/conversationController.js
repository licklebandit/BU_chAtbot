import Chat from '../models/Chat.js';

export const getConversationStats = async (req, res) => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // Get total conversations count
        const totalConversations = await Chat.countDocuments();

        // Get recent conversations counts
        const last24Hours = await Chat.countDocuments({ updatedAt: { $gte: twentyFourHoursAgo } });
        const lastWeek = await Chat.countDocuments({ updatedAt: { $gte: sevenDaysAgo } });
        const lastMonth = await Chat.countDocuments({ updatedAt: { $gte: thirtyDaysAgo } });

        // Get daily conversation counts for the last 7 days
        const dailyCounts = await Chat.aggregate([
            {
                $match: {
                    updatedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get hourly counts for the last 24 hours
        const hourlyCounts = await Chat.aggregate([
            {
                $match: {
                    updatedAt: { $gte: twentyFourHoursAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d %H:00", date: "$updatedAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get average messages per conversation
        const messageStats = await Chat.aggregate([
            {
                $project: {
                    messageCount: { $size: "$messages" }
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