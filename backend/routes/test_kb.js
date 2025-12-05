// backend/routes/test_kb.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load knowledge base
const knowledgePath = path.join(__dirname, '../data/knowledge.json');
let knowledgeData = [];

if (fs.existsSync(knowledgePath)) {
    try {
        knowledgeData = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
        console.log(`✅ Loaded ${knowledgeData.length} KB items from knowledge.json`);
        
        // Log all keywords for debugging
        console.log('📚 Available keywords in knowledge base:');
        knowledgeData.forEach((item, i) => {
            console.log(`  ${i + 1}. "${item.keyword}"`);
        });
    } catch (error) {
        console.error('❌ Failed to load knowledge.json:', error.message);
    }
} else {
    console.error(`❌ knowledge.json not found at: ${knowledgePath}`);
}

// Test endpoint that ALWAYS uses knowledge base
router.post('/test', (req, res) => {
    const { q } = req.body;
    const query = (q || '').toLowerCase().trim();
    
    console.log(`\n🔍 TEST KB LOOKUP: "${query}"`);
    
    if (!query) {
        return res.json({ 
            success: false, 
            error: "No query provided",
            availableKeywords: knowledgeData.map(k => k.keyword)
        });
    }
    
    if (knowledgeData.length === 0) {
        return res.json({ 
            success: false, 
            error: "Knowledge base is empty",
            path: knowledgePath
        });
    }
    
    // 1. Try exact keyword match
    for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        if (keyword === query) {
            console.log(`✅ Exact match found: "${item.keyword}"`);
            return res.json({
                success: true,
                query: q,
                match: item.keyword,
                answer: item.answer,
                matchType: 'exact',
                source: 'knowledge.json'
            });
        }
    }
    
    // 2. Try partial match (query contains keyword or keyword contains query)
    for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        if (keyword.includes(query) || query.includes(keyword)) {
            console.log(`✅ Partial match found: "${item.keyword}"`);
            return res.json({
                success: true,
                query: q,
                match: item.keyword,
                answer: item.answer,
                matchType: 'partial',
                source: 'knowledge.json'
            });
        }
    }
    
    // 3. Try word matching
    const queryWords = query.split(/\s+/).filter(w => w.length > 2);
    let bestMatch = null;
    let bestScore = 0;
    
    for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        let score = 0;
        
        for (const word of queryWords) {
            if (keyword.includes(word)) {
                score++;
            }
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }
    
    if (bestMatch && bestScore > 0) {
        console.log(`✅ Word match found: "${bestMatch.keyword}" (score: ${bestScore})`);
        return res.json({
            success: true,
            query: q,
            match: bestMatch.keyword,
            answer: bestMatch.answer,
            matchType: 'word',
            score: bestScore,
            source: 'knowledge.json'
        });
    }
    
    // 4. No match found
    console.log(`❌ No match found for: "${query}"`);
    return res.json({
        success: false,
        query: q,
        message: "No match found in knowledge base",
        availableKeywords: knowledgeData.map(k => k.keyword)
    });
});

export default router;