// backend/test-nonkb-queries.js
import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000/api/chat';

const testCases = [
    // Should use KB
    { question: "admission requirements", expected: "knowledge_base", type: "KB query" },
    { question: "tuition fees", expected: "knowledge_base", type: "KB query" },
    { question: "library hours", expected: "knowledge_base", type: "KB query" },
    { question: "contact information", expected: "knowledge_base", type: "KB query" },
    
    // Should use Gemini (non-KB)
    { question: "tell me a joke", expected: "gemini", type: "joke" },
    { question: "what is the meaning of life", expected: "gemini", type: "philosophy" },
    { question: "hello", expected: "gemini", type: "greeting" },
    { question: "how are you today?", expected: "gemini", type: "greeting" },
    { question: "what's the weather like?", expected: "gemini", type: "weather" },
    { question: "tell me a funny story", expected: "gemini", type: "story" },
    { question: "can you write me a poem?", expected: "gemini", type: "poem" },
    
    // Edge cases
    { question: "joke about university", expected: "gemini", type: "joke variation" },
    { question: "university admission joke", expected: "gemini", type: "mixed" },
    { question: "hello, i need admission info", expected: "knowledge_base", type: "mixed with KB" }
];

async function runTest() {
    console.log("🧪 TEST: Non-KB Query Detection");
    console.log("===============================\n");
    
    let results = { passed: 0, failed: 0 };
    
    for (const test of testCases) {
        console.log(`\n${test.type}: "${test.question}"`);
        console.log(`   Expected: ${test.expected}`);
        
        try {
            const startTime = Date.now();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: test.question })
            });
            
            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            console.log(`   ✅ Response (${responseTime}ms)`);
            console.log(`   Actual: ${data.source} (KB Match: ${data.kbMatch})`);
            
            if (data.source === test.expected) {
                console.log(`   🎉 PASS`);
                results.passed++;
                
                if (data.source === 'knowledge_base' && responseTime < 100) {
                    console.log(`   ⚡ Fast KB response!`);
                }
            } else {
                console.log(`   ❌ FAIL`);
                results.failed++;
                
                if (test.expected === 'knowledge_base' && data.source === 'gemini') {
                    console.log(`   💡 Tip: Add "${test.question}" to knowledge.json`);
                } else if (test.expected === 'gemini' && data.source === 'knowledge_base') {
                    console.log(`   ⚠️  KB is matching non-KB query - increase threshold`);
                }
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            results.failed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log("\n📊 RESULTS:");
    console.log(`Total: ${testCases.length}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success rate: ${Math.round((results.passed/testCases.length)*100)}%`);
    
    if (results.failed === 0) {
        console.log("\n🎉 PERFECT! Chatbot correctly distinguishes KB vs non-KB queries!");
    }
}

runTest();