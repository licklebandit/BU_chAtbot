// backend/utils/sessionManager.js
// In-memory session store for conversation context

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_HISTORY_LENGTH = 5; // Keep last 5 messages

class SessionManager {
    constructor() {
        this.sessions = new Map();

        // Cleanup expired sessions every 5 minutes
        setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
    }

    /**
     * Get or create a session for a user
     * @param {string} userId - Unique identifier for user/socket
     * @returns {Object} Session object
     */
    getSession(userId) {
        if (!this.sessions.has(userId)) {
            this.sessions.set(userId, {
                history: [],
                lastActive: Date.now(),
                apiCallCount: 0
            });
        } else {
            // Update last active time
            const session = this.sessions.get(userId);
            session.lastActive = Date.now();
        }

        return this.sessions.get(userId);
    }

    /**
     * Add a message to conversation history
     * @param {string} userId 
     * @param {string} role - 'user' or 'assistant'
     * @param {string} text - Message text
     * @param {Object} metadata - Additional info (kbUsed, source, etc.)
     */
    addMessage(userId, role, text, metadata = {}) {
        const session = this.getSession(userId);

        session.history.push({
            role,
            text,
            timestamp: Date.now(),
            ...metadata
        });

        // Keep only last N messages
        if (session.history.length > MAX_HISTORY_LENGTH * 2) { // *2 because we store both user and assistant
            session.history = session.history.slice(-MAX_HISTORY_LENGTH * 2);
        }
    }

    /**
     * Get conversation history for a user
     * @param {string} userId 
     * @param {number} count - Number of messages to retrieve (default: all)
     * @returns {Array} Message history
     */
    getHistory(userId, count = MAX_HISTORY_LENGTH * 2) {
        const session = this.getSession(userId);
        return session.history.slice(-count);
    }

    /**
     * Get the last assistant response
     * @param {string} userId 
     * @returns {Object|null} Last assistant message
     */
    getLastResponse(userId) {
        const history = this.getHistory(userId);

        // Find last assistant message
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].role === 'assistant') {
                return history[i];
            }
        }

        return null;
    }

    /**
     * Get the last user query
     * @param {string} userId 
     * @returns {Object|null} Last user message
     */
    getLastQuery(userId) {
        const history = this.getHistory(userId);

        // Find last user message
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].role === 'user') {
                return history[i];
            }
        }

        return null;
    }

    /**
     * Increment API call counter
     * @param {string} userId 
     */
    incrementApiCalls(userId) {
        const session = this.getSession(userId);
        session.apiCallCount++;
        console.log(`🤖 Gemini API call #${session.apiCallCount} for session ${String(userId).substring(0, 8)}...`);
    }

    /**
     * Get API call count for session
     * @param {string} userId 
     * @returns {number}
     */
    getApiCallCount(userId) {
        const session = this.sessions.get(userId);
        return session ? session.apiCallCount : 0;
    }

    /**
     * Clear a specific session
     * @param {string} userId 
     */
    clearSession(userId) {
        this.sessions.delete(userId);
        console.log(`🗑️  Cleared session for ${String(userId).substring(0, 8)}...`);
    }

    /**
     * Clean up expired sessions based on TTL
     */
    cleanupExpiredSessions() {
        const now = Date.now();
        let cleaned = 0;

        for (const [userId, session] of this.sessions.entries()) {
            if (now - session.lastActive > SESSION_TTL) {
                this.sessions.delete(userId);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} expired session(s)`);
        }
    }

    /**
     * Get session statistics
     * @returns {Object} Stats
     */
    getStats() {
        return {
            activeSessions: this.sessions.size,
            totalMessages: Array.from(this.sessions.values()).reduce((sum, s) => sum + s.history.length, 0),
            totalApiCalls: Array.from(this.sessions.values()).reduce((sum, s) => sum + s.apiCallCount, 0)
        };
    }
}

// Export singleton instance
const sessionManager = new SessionManager();
export default sessionManager;
