
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock environment setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Use dynamic import for the module to test
async function testSynthesis() {
    console.log("🧪 Testing Chat Synthesis Logic");
    console.log("--------------------------------");

    try {
        const { getChatResponse } = await import('./utils/getChatResponse.js');

        // Case 1: Strong KB Context
        const query1 = "How do I apply?";
        const context1 = "To apply, obtain an application form from the Registrar's office, fill it, and pay the fee.";

        console.log(`\n📝 Query: "${query1}"`);
        console.log(`ℹ️  Context: "${context1}"`);
        console.log("... Generating Response ...");

        const res1 = await getChatResponse(query1, context1);
        console.log(`\n🤖 AI Response 1:\n${res1.text}\n`);

        // Case 2: No Context (Should use general knowledge or admit lack of info if university related)
        const query2 = "What is the capital of France?";
        const context2 = ""; // Empty context

        console.log(`\n📝 Query: "${query2}"`);
        console.log(`ℹ️  Context: (Empty)`);
        console.log("... Generating Response ...");

        const res2 = await getChatResponse(query2, context2);
        console.log(`\n🤖 AI Response 2:\n${res2.text}\n`);

        console.log("✅ Synthesis Logic Verified.");

    } catch (err) {
        console.error("❌ Test Failed:", err);
    }
}

testSynthesis();
