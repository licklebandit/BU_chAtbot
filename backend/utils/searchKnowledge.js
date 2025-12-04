// backend/utils/searchKnowledge.js
import { searchSimilar } from "./vectorStore.js";
import Knowledge from "../models/Knowledge.js";

/**
 * Search the knowledge base using semantic search.
 * @param {string} query
 * @returns {string} context string (containing only the relevant info)
 */
export async function searchKnowledge(query) {
    console.log(`🔍 Starting knowledge search for: "${query}"`);
    
    try {
        // First try semantic vector search
        let topResults = [];
        try {
            const vectorSearchPromise = searchSimilar(query, 3);
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
            console.log(`✅ Vector search found ${topResults.length} result(s)`);
            return topResults.map(r => r.chunk).join("\n\n");
        }

        // Fallback to database search
        const allKnowledge = await getKnowledgeFromAllSources();
        
        if (allKnowledge && allKnowledge.length > 0) {
            const bestMatches = findBestMatches(query, allKnowledge);
            
            if (bestMatches.length > 0) {
                console.log(`✅ Found ${bestMatches.length} fallback match(es)`);
                return bestMatches.map(m => {
                    const title = m.item.keyword || m.item.question || 'Information';
                    const content = m.item.answer || m.item.content || '';
                    return `${title}: ${content}`;
                }).join('\n\n');
            }
        }
        
        console.log(`❌ No knowledge found for: "${query}"`);
        return "";
        
    } catch (error) {
        console.error("Knowledge search error:", error);
        return "";
    }
}

// Helper function to get knowledge from all sources
async function getKnowledgeFromAllSources() {
    const allKnowledge = [];
    
    try {
        // Fetch from database
        const dbKnowledge = await Knowledge.find({ isActive: true }).lean();
        allKnowledge.push(...dbKnowledge.map(item => ({
            ...item,
            source: item.source || 'Database'
        })));
        console.log(`📚 Loaded ${dbKnowledge.length} items from database`);
    } catch (dbErr) {
        console.warn("Database knowledge fetch failed:", dbErr.message);
    }

    try {
        // Fetch from static file
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'backend/data/knowledge.json');
        if (fs.existsSync(filePath)) {
            const staticData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            allKnowledge.push(...staticData.map(item => ({
                ...item,
                source: 'Static File',
                question: item.keyword,
                answer: item.answer
            })));
            console.log(`📄 Loaded ${staticData.length} items from JSON file`);
        }
    } catch (fileErr) {
        console.warn("Static knowledge file fetch failed:", fileErr.message);
    }
    
    return allKnowledge;
}

// Helper function to find best matches
function findBestMatches(query, allKnowledge) {
    const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const queryLower = normalize(query);
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    const scored = allKnowledge.map(item => {
        const keyword = normalize(item.keyword || item.question || '');
        const answer = normalize(item.answer || item.content || '');
        const combined = `${keyword} ${answer}`.trim();

        // Score calculations
        let score = 0;
        
        // Exact phrase match
        if (combined.includes(queryLower)) score += 10;
        
        // Word matches
        queryWords.forEach(word => {
            if (combined.includes(word)) score += 3;
        });
        
        // Priority bonus
        if (item.priority) score += item.priority;
        
        return { item, score };
    });

    // Sort by score and return top matches
    scored.sort((a, b) => b.score - a.score);
    return scored.filter(s => s.score > 0).slice(0, 3);
}