// backend/test-chatbot.js
import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000/api/chat';

async function testChatbot() {
    const testQuestions = [
        "admission requirements",
        "tuition fees",
        "courses offered",
        "where is the library?",
        "hello how are you?"
    ];

    console.log("🤖 Testing Chatbot Responses\n");

    for (const question of testQuestions) {
        console.log(`\n=== Question: "${question}" ===`);
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: question })
            });
            
            const data = await response.json();
            
            console.log(`✅ Response received`);
            console.log(`Source: ${data.source}`);
            console.log(`KB Match: ${data.kbMatch}`);
            console.log(`Answer: ${data.answer.substring(0, 100)}...`);
            
            // Check if it's using KB or Gemini
            if (data.source === 'knowledge_base') {
                console.log(`🎯 PERFECT! Using knowledge base (no Gemini API call)`);
            } else if (data.source === 'gemini') {
                console.log(`⚠️ Using Gemini API (no KB match found)`);
            }
            
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
        }
        
        // Wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("\n✅ All tests completed!");
}

testChatbot();