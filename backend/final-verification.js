// backend/final-verification.js
import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000/api/chat';

const realisticUserQueries = [
    // Real university questions (should use KB)
    { q: "what are the admission requirements?", expected: "knowledge_base", type: "Admissions" },
    { q: "how much are tuition fees?", expected: "knowledge_base", type: "Fees" },
    { q: "what courses do you offer?", expected: "knowledge_base", type: "Courses" },
    { q: "where is the library?", expected: "knowledge_base", type: "Library" },
    { q: "what are the library hours?", expected: "knowledge_base", type: "Library hours" },
    { q: "how do I contact the university?", expected: "knowledge_base", type: "Contact" },
    { q: "who is the vice chancellor?", expected: "knowledge_base", type: "Administration" },
    { q: "do you have hostel accommodation?", expected: "knowledge_base", type: "Accommodation" },
    { q: "are there scholarships available?", expected: "knowledge_base", type: "Scholarships" },
    
    // Conversational (should use Gemini)
    { q: "hello", expected: "gemini", type: "Greeting" },
    { q: "how are you?", expected: "gemini", type: "Greeting" },
    { q: "tell me a joke", expected: "gemini", type: "Joke" },
    { q: "what's the weather like?", expected: "gemini", type: "Weather" },
    { q: "tell me about yourself", expected: "gemini", type: "About" },
    { q: "what can you do?", expected: "gemini", type: "Capabilities" },
    
    // Mixed/Edge cases
    { q: "I need help with admission", expected: "knowledge_base", type: "Mixed - admission help" },
    { q: "can you tell me about fees and also tell a joke?", expected: "gemini", type: "Mixed - fee + joke" }
];

async function runVerification() {
    console.log("🎓 FINAL CHATBOT VERIFICATION - REALISTIC SCENARIOS");
    console.log("===================================================\n");
    
    let results = { total: 0, kb: 0, gemini: 0, correct: 0, incorrect: 0 };
    
    for (const test of realisticUserQueries) {
        results.total++;
        
        console.log(`\n${test.type}: "${test.q}"`);
        
        try {
            const startTime = Date.now();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: test.q })
            });
            
            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            // Count by source
            if (data.source === 'knowledge_base') results.kb++;
            if (data.source === 'gemini') results.gemini++;
            
            // Check correctness
            const isCorrect = data.source === test.expected;
            if (isCorrect) results.correct++;
            else results.incorrect++;
            
            console.log(`   Source: ${data.source} (expected: ${test.expected})`);
            console.log(`   Time: ${responseTime}ms`);
            console.log(`   ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
            
            // Performance feedback
            if (data.source === 'knowledge_base' && responseTime < 100) {
                console.log(`   ⚡ Fast KB response!`);
            } else if (data.source === 'knowledge_base' && responseTime > 100) {
                console.log(`   ⏱️  Slow KB response`);
            } else if (data.source === 'gemini' && responseTime < 3000) {
                console.log(`   👍 Good Gemini response time`);
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            results.incorrect++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("\n📊 FINAL RESULTS");
    console.log("================");
    console.log(`Total queries tested: ${results.total}`);
    console.log(`Correct: ${results.correct}/${results.total} (${Math.round((results.correct/results.total)*100)}%)`);
    console.log(`KB responses: ${results.kb} (${Math.round((results.kb/results.total)*100)}%)`);
    console.log(`Gemini responses: ${results.gemini} (${Math.round((results.gemini/results.total)*100)}%)`);
    
    const accuracy = Math.round((results.correct/results.total)*100);
    
    if (accuracy >= 90) {
        console.log("\n🎉🎉🎉 EXCELLENT! Chatbot is ready for production! 🎉🎉🎉");
        console.log("✅ KB-first strategy working perfectly");
        console.log("✅ Fast responses for university questions");
        console.log("✅ Appropriate Gemini usage for non-KB questions");
    } else if (accuracy >= 80) {
        console.log("\n👍 GOOD! Chatbot is working well.");
        console.log("Consider minor improvements to edge cases.");
    } else {
        console.log("\n⚠️  NEEDS IMPROVEMENT");
        console.log("Check the incorrect responses above.");
    }
    
    console.log("\n💡 Deployment Recommendations:");
    console.log("1. Monitor Google Cloud Console for API usage");
    console.log("2. Add more university questions to knowledge.json over time");
    console.log("3. Consider adding synonyms for common queries");
    console.log("4. Test with real users for feedback");
}

runVerification();