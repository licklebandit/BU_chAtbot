// backend/utils/searchKnowledge.js
import { searchSimilar } from "./vectorStore.js";

/**
 * Search the knowledge base using semantic search.
 * @param {string} query
 * @param {Array} knowledge - Fallback knowledge items [{keyword, answer}]
 * @returns {string} context string (containing only the relevant info)
 */
export async function searchKnowledge(query, knowledge = []) {
    // normalize query: lower-case and strip punctuation to improve matching
    const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const queryLower = normalize(query);

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
        // Prepare normalized KB combined strings to avoid punctuation mismatches
        const scored = knowledge.map(item => {
            const keyword = normalize(item.keyword || item.question || item.title || '');
            const answer = normalize(item.answer || item.content || item.answerText || '');
            const combined = `${keyword} ${answer}`.trim();

            // Exact substring match boosts score strongly
            const exactMatch = combined.includes(queryLower) ? 5 : 0;

            // Count matching words between query and KB item (ignore short words)
            const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
            const matchCount = queryWords.filter(w => combined.includes(w)).length;

            // Final score combines exact match boost with word overlap
            const score = exactMatch + matchCount;
            return { item, score, combined };
        });

        // Debug: log queryWords and top candidates to aid troubleshooting
        try {
            const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
            console.log('🔎 searchKnowledge - queryWords:', queryWords, 'knowledgeCount:', knowledge.length);
            const preview = scored.slice().sort((a,b)=>b.score-a.score).slice(0,3).map(s => ({ label: (s.item.keyword||s.item.question||s.item.title||'item'), score: s.score }));
            console.log('🔎 searchKnowledge - topCandidates:', preview);
        } catch (dbgErr) {
            // ignore debug errors
        }

        // Sort by score (descending) and return best match if score > 0
        scored.sort((a, b) => b.score - a.score);

        // Return top 3 matches if available for better context
        const topMatches = scored.filter(s => s.score > 0).slice(0, 3);
        if (topMatches.length > 0) {
            const keyLabel = (topMatches[0].item.keyword || topMatches[0].item.question || topMatches[0].item.title) || 'item';
            console.log(`✅ Knowledge fallback: Found ${topMatches.length} match(es) for "${keyLabel}" (top score: ${topMatches[0].score})`);
            // Combine top matches for richer context
            return topMatches.map(m => {
                const title = m.item.keyword || m.item.question || m.item.title || 'Information';
                const content = m.item.answer || m.item.content || '';
                return `${title}: ${content}`;
            }).join('\n\n');
        }
    }

    return ""; // No context available
}