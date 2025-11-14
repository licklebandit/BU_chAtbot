// backend/utils/searchKnowledge.js
import { searchSimilar } from "./vectorStore.js";

/**
 * Search the knowledge base using semantic search.
 * @param {string} query
 * @param {Array} knowledge - Fallback knowledge items [{keyword, answer}]
 * @returns {string} context string (containing only the relevant info)
 */
export async function searchKnowledge(query, knowledge = []) {
    const queryLower = query.toLowerCase();

    // 1. First try semantic vector search (with timeout to prevent hanging)
    // Using catch here ensures the function doesn't crash if the vector store is empty/broken
    let topResults = [];
    try {
        const vectorSearchPromise = searchSimilar(query, 3);
        // Add a 2-second timeout to prevent hanging
        topResults = await Promise.race([
            vectorSearchPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Vector search timeout')), 2000))
        ]).catch(err => {
            console.warn("Vector search failed or timed out:", err.message);
            return [];
        });
    } catch (err) {
        console.error("Vector search error:", err);
        topResults = [];
    }
    
    if (topResults && topResults.length > 0) {
        // Combine top results as context
        return topResults.map(r => r.chunk).join("\n\n");
    }

    // 2. Fallback: flexible matching across possible KB schemas (keyword/question/title) + answer/content
    if (knowledge && knowledge.length > 0) {
        const scored = knowledge.map(item => {
            const keyword = ((item.keyword || item.question || item.title) || "").toLowerCase();
            const answer = ((item.answer || item.content || item.answerText) || "").toLowerCase();
            const combined = `${keyword} ${answer}`;

            // Exact substring match boosts score strongly
            const exactMatch = combined.includes(queryLower) ? 5 : 0;

            // Count matching words between query and KB item (ignore short words)
            const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
            const matchCount = queryWords.filter(w => combined.includes(w)).length;

            // Final score combines exact match boost with word overlap
            const score = exactMatch + matchCount;
            return { item, score };
        });

        // Sort by score (descending) and return best match if score > 0
        scored.sort((a, b) => b.score - a.score);

        if (scored[0] && scored[0].score > 0) {
            const keyLabel = (scored[0].item.keyword || scored[0].item.question || scored[0].item.title) || 'item';
            console.log(`✅ Knowledge fallback: Found match for "${keyLabel}" (score: ${scored[0].score})`);
            return (scored[0].item.answer || scored[0].item.content || '');
        }
    }

    return ""; // No context available
}