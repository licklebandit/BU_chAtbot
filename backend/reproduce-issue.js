import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadKnowledgeBase } from './utils/knowledgeLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log("🛠️ Starting Reproduction Script...");

// Connect to DB
console.log("⏳ Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected.");
        // Immediate load attempt
        testLoad();
    })
    .catch(err => console.error("❌ DB Attempt Failed:", err));

async function testLoad() {
    console.log("🏃 Running loadKnowledgeBase()...");
    const items = await loadKnowledgeBase();
    console.log(`🏁 Result: Loaded ${items.length} items.`);

    const adminItems = items.filter(i => i.source === 'Admin Dashboard');
    console.log(`📊 Admin Items: ${adminItems.length}`);

    if (adminItems.length === 0) {
        console.log("❌ FAILURE: No admin items loaded.");
    } else {
        console.log("✅ SUCCESS: Admin items loaded.");
    }

    process.exit(0);
}
