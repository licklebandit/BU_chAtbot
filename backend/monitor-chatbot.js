// backend/monitor-chatbot.js
import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000/api/chat';
const TEST_INTERVAL = 5000; // 5 seconds

async function monitorChatbot() {
    console.log("👁️  Chatbot Monitor Started");
    console.log("==========================\n");
    console.log("Monitoring for KB vs Gemini usage...");
    console.log("Press Ctrl+C to stop\n");

    let testCount = 0;
    let kbUsage = 0;
    let geminiUsage = 0;

    const testQuestions = [
        "admission requirements",
        "tuition fees",
        "courses offered",
        "what is your name?",
        "tell me a joke",
        "library hours",
        "contact information"
    ];

    setInterval(async () => {
        testCount++;
        const question = testQuestions[Math.floor(Math.random() * testQuestions.length)];
        
        console.log(`\n[Test ${testCount}] Question: "${question}"`);
        
        try {
            const startTime = Date.now();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: question })
            });
            
            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            console.log(`   ⏱️  Response time: ${responseTime}ms`);
            console.log(`   📍 Source: ${data.source}`);
            console.log(`   🎯 KB Match: ${data.kbMatch ? 'Yes' : 'No'}`);
            
            if (data.source === 'knowledge_base') {
                kbUsage++;
                console.log(`   ✅ Using Knowledge Base (No Gemini API call)`);
            } else if (data.source === 'gemini') {
                geminiUsage++;
                console.log(`   🤖 Using Gemini API`);
            }
            
            console.log(`   📊 Stats: KB=${kbUsage}, Gemini=${geminiUsage}, Total=${testCount}`);
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }, TEST_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log("\n\n📊 Final Statistics:");
    console.log(`Total tests: ${testCount || 0}`);
    console.log(`KB usage: ${kbUsage || 0} (${testCount ? Math.round((kbUsage/testCount)*100) : 0}%)`);
    console.log(`Gemini usage: ${geminiUsage || 0} (${testCount ? Math.round((geminiUsage/testCount)*100) : 0}%)`);
    console.log("\n👋 Monitor stopped");
    process.exit(0);
});

monitorChatbot();