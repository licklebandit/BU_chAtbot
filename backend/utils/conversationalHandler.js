// backend/utils/conversationalHandler.js
// Template-based conversational responses (0 API cost)

/**
 * Generate a confirmation response based on previous answer
 * @param {Object} lastResponse - Previous assistant message
 * @param {string} query - Current user query
 * @returns {string} Confirmation response
 */
export function generateConfirmation(lastResponse, query) {
    if (!lastResponse || !lastResponse.text) {
        return "I apologize, but I don't have any previous information to confirm. Could you please ask your question again?";
    }

    const confirmationPhrases = [
        "Yes, that's correct! ",
        "Absolutely! ",
        "Yes, exactly! ",
        "That's right! ",
        "Indeed! ",
        "Correct! "
    ];

    // Pick a random confirmation phrase
    const phrase = confirmationPhrases[Math.floor(Math.random() * confirmationPhrases.length)];

    // If the previous response was from KB, we can confidently confirm
    if (lastResponse.source === 'Knowledge Base') {
        return `${phrase}${lastResponse.text}`;
    }

    // For other sources, add a softer confirmation
    return `${phrase}Based on the information I have: ${lastResponse.text}`;
}

/**
 * Generate a follow-up response with additional information
 * @param {Object} lastResponse - Previous assistant message
 * @param {Array} relatedEntries - Related KB entries
 * @returns {string} Follow-up response
 */
export function generateFollowUp(lastResponse, relatedEntries = []) {
    if (!lastResponse || !lastResponse.text) {
        return "I'd be happy to provide more information! What would you like to know about Bugema University?";
    }

    // If we have related entries, share them
    if (relatedEntries && relatedEntries.length > 0) {
        const additional = relatedEntries
            .slice(0, 2) // Limit to 2 additional entries
            .map(entry => `• ${entry.answer}`)
            .join('\n\n');

        return `Here's some additional information:\n\n${additional}`;
    }

    // If no related entries, acknowledge and offer help
    return `I've shared what I know on that topic. Is there anything specific you'd like me to clarify, or would you like to ask about something else?`;
}

/**
 * Generate a clarification response (rephrase previous answer)
 * @param {Object} lastResponse - Previous assistant message
 * @returns {string} Clarification response
 */
export function generateClarification(lastResponse) {
    if (!lastResponse || !lastResponse.text) {
        return "I'd be happy to clarify! What specifically would you like me to explain?";
    }

    const clarificationIntros = [
        "Let me explain that better: ",
        "To clarify: ",
        "What I mean is: ",
        "In other words: ",
        "Let me rephrase: "
    ];

    const intro = clarificationIntros[Math.floor(Math.random() * clarificationIntros.length)];

    return `${intro}${lastResponse.text}`;
}

/**
 * Detect if a query is asking for confirmation
 * @param {string} query 
 * @returns {boolean}
 */
export function isConfirmationQuery(query) {
    const confirmationPatterns = [
        /^sure\??$/i,
        /^really\??$/i,
        /^are you sure\??$/i,
        /^is that (right|correct|true)\??$/i,
        /^(yeah|yes)\??$/i,
        /^seriously\??$/i,
        /^for real\??$/i
    ];

    const cleanQuery = query.trim();
    return confirmationPatterns.some(pattern => pattern.test(cleanQuery));
}

/**
 * Detect if a query is asking for more information
 * @param {string} query 
 * @returns {boolean}
 */
export function isFollowUpQuery(query) {
    const followUpPatterns = [
        /tell me more/i,
        /what else/i,
        /more (info|information|details)/i,
        /^more\??$/i,
        /^and\??$/i,
        /continue/i,
        /elaborate/i
    ];

    return followUpPatterns.some(pattern => pattern.test(query));
}

/**
 * Detect if a query is asking for clarification
 * @param {string} query 
 * @returns {boolean}
 */
export function isClarificationQuery(query) {
    const clarificationPatterns = [
        /what do you mean/i,
        /explain/i,
        /clarify/i,
        /how so/i,
        /^what\??$/i,
        /^huh\??$/i,
        /^pardon\??$/i,
        /i don't understand/i
    ];

    return clarificationPatterns.some(pattern => pattern.test(query));
}

/**
 * Extract keywords from conversation context
 * @param {Array} history - Conversation history
 * @returns {Array} Keywords for expanded search
 */
export function extractContextKeywords(history) {
    if (!history || history.length === 0) return [];

    const keywords = [];
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were'];

    // Get last 3 messages
    const recentMessages = history.slice(-6); // 3 user + 3 assistant

    recentMessages.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
            const words = msg.text
                .toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word =>
                    word.length > 3 &&
                    !stopWords.includes(word)
                );

            keywords.push(...words);
        }
    });

    // Remove duplicates and return
    return [...new Set(keywords)];
}

/**
 * Detect if a query is a greeting
 * @param {string} query 
 * @returns {boolean}
 */
export function isGreeting(query) {
    const greetingPatterns = [
        /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening|day))$/i,
        /^(howdy|sup|what'?s\s+up)$/i,
        /^yo$/i
    ];

    const cleanQuery = query.trim();
    return greetingPatterns.some(pattern => pattern.test(cleanQuery));
}

/**
 * Detect if a query is a farewell
 * @param {string} query 
 * @returns {boolean}
 */
export function isFarewell(query) {
    const farewellPatterns = [
        /^(bye|goodbye|see\s+you|farewell|later)$/i,
        /^thank/i,
        /^thanks/i
    ];

    const cleanQuery = query.trim();
    return farewellPatterns.some(pattern => pattern.test(cleanQuery));
}

/**
 * Generate a greeting response
 * @returns {string} Greeting message
 */
export function generateGreeting() {
    const greetings = [
        "Hello! I'm BUchatbot, your campus assistant. How can I help you today?",
        "Hi there! Welcome to Bugema University. What would you like to know?",
        "Hey! I'm here to help you with any questions about Bugema University. What can I assist you with?",
        "Greetings! I'm your BU campus assistant. How may I help you today?",
        "Hello! Feel free to ask me anything about Bugema University!"
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Generate a farewell response
 * @returns {string} Farewell message
 */
export function generateFarewell() {
    const farewells = [
        "You're welcome! Feel free to come back anytime you have questions about Bugema University. Goodbye!",
        "Happy to help! If you need anything else, just ask. See you later!",
        "Glad I could assist! Have a great day at Bugema University!",
        "You're most welcome! Don't hesitate to ask if you need more information. Bye!",
        "My pleasure! Wishing you all the best at BU. Take care!"
    ];

    return farewells[Math.floor(Math.random() * farewells.length)];
}
