import { loadKnowledgeBase } from './utils/knowledgeLoader.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));


// Mock the search function from chat.js (since it's not exported)
// We'll reproduce the core logic here to debug it
function debugSearch(query, knowledgeBase) {
    console.log(`\n🔍 Debugging Search for: "${query}"`);
    const cleanQuery = query.toLowerCase().trim();
    const queryWords = cleanQuery.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);

    let bestMatch = null;
    let bestScore = 0;

    knowledgeBase.forEach(item => {
        let score = 0;
        const keyword = item.keyword.toLowerCase();

        // Exact
        if (keyword === cleanQuery) score += 100;
        // Contains
        if (cleanQuery.includes(keyword)) score += 80;
        if (keyword.includes(cleanQuery)) score += 70;

        // Words
        queryWords.forEach(qw => {
            if (keyword.includes(qw)) score += 15;
        });

        if (score > 0) {
            console.log(`   - Candidate: "${item.keyword}" (Score: ${score}, Source: ${item.source})`);
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    });

    return { bestMatch, bestScore };
}

// Import Model
import Knowledge from './models/Knowledge.js';

async function runDebug() {
    try {
        console.log("⏳ Connecting to DB...");
        // Wait for connection
        if (mongoose.connection.readyState !== 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const count = await Knowledge.countDocuments();
        console.log(`📊 Raw MongoDB Count in 'knowledges' collection: ${count}`);

        const allDocs = await Knowledge.find({}).limit(5);
        console.log("   Sample Docs:", JSON.stringify(allDocs, null, 2));

        console.log("⏳ Loading Knowledge Base via Loader...");
        const kb = await loadKnowledgeBase();

        console.log(`\n📊 KB Stats:`);
        console.log(`   Total Items: ${kb.length}`);

        // Count by source
        const bySource = kb.reduce((acc, item) => {
            acc[item.source] = (acc[item.source] || 0) + 1;
            return acc;
        }, {});
        console.log("   By Source:", bySource);

        // Check for specific HOD terms
        console.log("\n🔎 Searching for 'HOD' or 'Computing' items:");
        const hodItems = kb.filter(item =>
            item.keyword.toLowerCase().includes('hod') ||
            item.keyword.toLowerCase().includes('computing') ||
            item.answer.toLowerCase().includes('hod')
        );
        hodItems.forEach(item => {
            console.log(`   - [${item.source}] Q: "${item.keyword}"`);
        });

        // Run Test Query
        const query = "who is the hod of computing and informatics";
        const result = debugSearch(query, kb);

        console.log("\n🎯 Result:");
        if (result.bestMatch) {
            console.log(`   Best Match: "${result.bestMatch.keyword}" (Score: ${result.bestScore})`);
            console.log(`   Answer Preview: ${result.bestMatch.answer.substring(0, 100)}...`);
        } else {
            console.log("   No match found.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

runDebug();
