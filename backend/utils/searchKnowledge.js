// utils/searchKnowledge.js
import { searchSimilar } from "./vectorStore.js";

/**
 * Search the knowledge base using semantic search.
 * @param {string} query
 * @param {Array} knowledge - Fallback knowledge items [{keyword, answer}]
 * @returns {string} context string (containing only the relevant info)
 */
export async function searchKnowledge(query, knowledge = []) {
    const queryLower = query.toLowerCase();

    // 1. First try semantic vector search
    const topResults = await searchSimilar(query, 3);
    if (topResults.length > 0) {
        // Combine top results as context
        return topResults.map(r => r.chunk).join("\n\n");
    }

    // 2. Fallback: naive match in knowledge.json
    if (knowledge.length > 0) {
        
        // 🛑 FIX: Check against 'keyword' and 'answer' fields for a match
        const match = knowledge.find(item => 
            (item.keyword && queryLower.includes(item.keyword.toLowerCase())) ||
            (item.answer && queryLower.includes(item.answer.toLowerCase()))
        );

        if (match) {
            // Only return the SPECIFIC matching answer, not all knowledge
            console.log(`Knowledge fallback: Found match for keyword: ${match.keyword}`);
            return match.answer; 
        }
    }

    return ""; // No context available
}