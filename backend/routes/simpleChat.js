// backend/routes/simpleChat.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load knowledge base once
const knowledgePath = path.join(__dirname, '../data/knowledge.json');
const knowledgeData = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));

router.post('/simple', async (req, res) => {
    try {
        const { q } = req.body;
        const query = q.toLowerCase().trim();
        
        // Simple exact match search
        for (const item of knowledgeData) {
            const keyword = (item.keyword || '').toLowerCase();
            if (keyword.includes(query) || query.includes(keyword)) {
                return res.json({
                    answer: item.answer,
                    match: true,
                    keyword: item.keyword
                });
            }
        }
        
        // Try partial matching
        const words = query.split(/\s+/).filter(w => w.length > 2);
        for (const item of knowledgeData) {
            const keyword = (item.keyword || '').toLowerCase();
            const answer = (item.answer || '').toLowerCase();
            const combined = `${keyword} ${answer}`;
            
            for (const word of words) {
                if (combined.includes(word)) {
                    return res.json({
                        answer: item.answer,
                        match: true,
                        keyword: item.keyword,
                        matchedWord: word
                    });
                }
            }
        }
        
        // No match found
        res.json({
            answer: "I don't have information about that. Please ask about Bugema University admissions, courses, or campus information.",
            match: false
        });
        
    } catch (error) {
        console.error("Simple chat error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;