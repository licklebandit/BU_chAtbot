import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Knowledge from '../models/Knowledge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store the KB in memory
let knowledgeBaseCache = [];

/**
 * Loads knowledge base from both JSON file and MongoDB
 * @returns {Promise<Array>} The combined knowledge base
 */
export const loadKnowledgeBase = async () => {
    try {
        let combinedKB = [];

        // 1. Load from JSON file (Static Data)
        const kbPath = path.join(__dirname, '../data/knowledge.json');
        if (fs.existsSync(kbPath)) {
            try {
                const data = fs.readFileSync(kbPath, 'utf8');
                const jsonItems = JSON.parse(data);

                // Map to consistent format if needed
                const formattedJson = jsonItems.map(item => ({
                    ...item,
                    source: item.source || 'Static File'
                }));

                combinedKB = [...formattedJson];
                console.log(`📂 Loaded ${formattedJson.length} static items from knowledge.json`);
            } catch (jsonErr) {
                console.error("❌ Error reading knowledge.json:", jsonErr.message);
            }
        } else {
            console.warn("⚠️ knowledge.json not found at:", kbPath);
        }

        // 2. Load from MongoDB (Dynamic Admin Data)
        try {
            // Check connection state
            console.log(`🔌 KnowledgeLoader: MongoDB State = ${mongoose.connection.readyState} (1=Connected)`);

            // Find all articles where type is 'knowledge' or missing (legacy) or 'faq'
            const dbItems = await Knowledge.find({}).lean();
            console.log(`👀 KnowledgeLoader: Found ${dbItems.length} raw documents in DB`);

            if (dbItems.length > 0) {
                const formattedDbItems = dbItems.map(item => ({
                    keyword: item.question || item.title || item.keyword, // Map 'question' to 'keyword'
                    answer: item.answer || item.content,
                    category: item.category || item.type || 'general',
                    tags: item.tags || [],
                    priority: item.priority || 50, // Default priority
                    source: 'Admin Dashboard',
                    _id: item._id
                })).filter(item => item.keyword && item.answer); // Ensure valid items

                combinedKB = [...combinedKB, ...formattedDbItems];
                console.log(`🗄️  Loaded ${formattedDbItems.length} dynamic items from MongoDB`);
            } else {
                console.warn("⚠️ KnowledgeLoader: No documents found in 'knowledges' collection.");
            }
        } catch (dbErr) {
            console.error("❌ Error reading from MongoDB:", dbErr.message);
        }

        // Update cache
        knowledgeBaseCache = combinedKB;
        console.log(`✅ Total Knowledge Base Size: ${knowledgeBaseCache.length} items`);

        return knowledgeBaseCache;
    } catch (error) {
        console.error("❌ Critical error in loadKnowledgeBase:", error.message);
        return knowledgeBaseCache; // Return existing cache on error
    }
};

/**
 * Gets the current knowledge base from memory
 * @returns {Array}
 */
export const getKnowledgeBase = () => {
    return knowledgeBaseCache;
};
