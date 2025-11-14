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

    // 2. Fallback: simple word-overlap matching in knowledge.json
    if (knowledge && knowledge.length > 0) {
        // Score each KB item by how many words it shares with the query
        const scored = knowledge.map(item => {
            const keyword = (item.keyword || "").toLowerCase();
            const answer = (item.answer || "").toLowerCase();
            const combined = `${keyword} ${answer}`;
            
            // Count matching words between query and KB item
            const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
            const matchCount = queryWords.filter(w => combined.includes(w)).length;
            
            return { item, matchCount };
        });

        // Sort by match count (descending) and return best match if score > 0
        scored.sort((a, b) => b.matchCount - a.matchCount);
        
        if (scored[0] && scored[0].matchCount > 0) {
            console.log(`✅ Knowledge fallback: Found match for "${scored[0].item.keyword}" (score: ${scored[0].matchCount})`);
            return scored[0].item.answer; 
        }
    }

    return ""; // No context available
}