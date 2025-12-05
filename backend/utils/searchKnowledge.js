// backend/utils/searchKnowledge.js - FIXED VERSION
import Knowledge from "../models/Knowledge.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Search the knowledge base with aggressive matching
 */
export async function searchKnowledge(query) {
    if (!query || typeof query !== 'string') return "";
    
    const cleanQuery = query.toLowerCase().trim();
    console.log(`🔍 Searching knowledge for: "${cleanQuery}"`);
    
    try {
        // OPTION 1: Load from knowledge.json file directly
        const jsonPath = path.join(__dirname, '../data/knowledge.json');
        if (fs.existsSync(jsonPath)) {
            const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            console.log(`📚 Loaded ${rawData.length} items from knowledge.json`);
            
            // Convert to Knowledge model format if needed
            const kbItems = rawData.map(item => ({
                question: item.keyword,
                answer: item.answer,
                tags: item.tags || [],
                category: item.category || "academic"
            }));
            
            const directMatch = findDirectMatch(cleanQuery, kbItems);
            if (directMatch) {
                console.log(`✅ Found direct match in knowledge.json: "${directMatch.question}"`);
                return directMatch.answer;
            }
        }
        
        // OPTION 2: Search MongoDB
        try {
            // First, try exact or near-exact match
            const exactMatch = await Knowledge.findOne({
                $or: [
                    { question: { $regex: cleanQuery, $options: 'i' } },
                    { answer: { $regex: cleanQuery, $options: 'i' } }
                ],
                isActive: true
            });
            
            if (exactMatch) {
                console.log(`✅ Found exact DB match: "${exactMatch.question}"`);
                return exactMatch.answer;
            }
            
            // Try word-by-word matching
            const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
            if (words.length > 0) {
                const wordRegex = words.join('|');
                const wordMatch = await Knowledge.findOne({
                    $or: [
                        { question: { $regex: wordRegex, $options: 'i' } },
                        { answer: { $regex: wordRegex, $options: 'i' } }
                    ],
                    isActive: true
                });
                
                if (wordMatch) {
                    console.log(`✅ Found word match in DB: "${wordMatch.question}"`);
                    return wordMatch.answer;
                }
            }
            
        } catch (dbError) {
            console.warn("Database search error:", dbError.message);
        }
        
        console.log("❌ No matches found in knowledge base");
        return "";
        
    } catch (error) {
        console.error("searchKnowledge error:", error);
        return "";
    }
}

// Helper function for direct matching
function findDirectMatch(query, items) {
    // Try exact keyword match first
    for (const item of items) {
        const keyword = (item.question || '').toLowerCase();
        if (keyword.includes(query) || query.includes(keyword)) {
            return item;
        }
    }
    
    // Try word matching
    const words = query.split(/\s+/).filter(w => w.length > 2);
    for (const item of items) {
        const keyword = (item.question || '').toLowerCase();
        const answer = (item.answer || '').toLowerCase();
        const combined = `${keyword} ${answer}`;
        
        let matchScore = 0;
        for (const word of words) {
            if (combined.includes(word)) {
                matchScore++;
            }
        }
        
        // If at least 50% of words match, return it
        if (matchScore > 0 && matchScore >= words.length * 0.5) {
            return item;
        }
    }
    
    return null;
}

// Also export for backward compatibility
export async function searchKnowledgeWithFallback(query, knowledge = []) {
    const result = await searchKnowledge(query);
    return result || "";
}