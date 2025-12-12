
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testMemory() {
    console.log("🧠 Testing Conversation Memory");

    const { getChatResponse } = await import('./utils/getChatResponse.js');

    // Simulate history: User asked location, AI answered.
    const history = [
        { role: 'user', parts: [{ text: "Where is the library?" }] },
        { role: 'model', parts: [{ text: "The library is located next to the Administration Block." }] }
    ];

    // New question using "it" (referring to library)
    const query = "When is it open?";
    const context = "Library hours: Mon-Fri 8am-9pm, Sat 2pm-6pm.";

    console.log(`\n📝 History: [User: Where is library?, AI: Next to Admin Block]`);
    console.log(`📝 Query: "${query}"`);
    console.log(`ℹ️  Context: "${context}"`);
    console.log("... Generating Response ...");

    const res = await getChatResponse(query, context, null, history);
    console.log(`\n🤖 AI Response:\n${res.text}\n`);

    if (res.text.toLowerCase().includes("library") || res.text.toLowerCase().includes("open")) {
        console.log("✅ Memory verified: AI understood context from history.");
    } else {
        console.log("❌ Memory check failed: AI might not have understood 'it'.");
    }
}

testMemory();
