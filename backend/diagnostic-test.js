// backend/diagnostic-test.js
import fetch from 'node-fetch';

async function runDiagnostics() {
    console.log("🩺 CHATBOT DIAGNOSTIC TEST");
    console.log("==========================\n");
    
    const baseURL = 'http://localhost:8000';
    
    // Test 1: Check if server is running
    console.log("1. Testing server connection...");
    try {
        const ping = await fetch(baseURL);
        console.log(`   ✅ Server is running (Status: ${ping.status})`);
    } catch (error) {
        console.log(`   ❌ Server not reachable: ${error.message}`);
        return;
    }
    
    // Test 2: Test KB-only endpoint
    console.log("\n2. Testing Knowledge Base endpoint...");
    try {
        const response = await fetch(`${baseURL}/api/chat/test-kb`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: "admission requirements" })
        });
        
        const data = await response.json();
        console.log(`   ✅ KB endpoint responded`);
        console.log(`   📊 Response:`, JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.log(`   ❌ KB test failed: ${error.message}`);
    }
    
    // Test 3: Test main chat endpoint with KB question
    console.log("\n3. Testing main chat with KB question...");
    try {
        const response = await fetch(`${baseURL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: "admission requirements" })
        });
        
        const data = await response.json();
        console.log(`   ✅ Chat endpoint responded`);
        console.log(`   📍 Source: ${data.source}`);
        console.log(`   🎯 KB Match: ${data.kbMatch}`);
        console.log(`   📝 Answer preview: ${data.answer.substring(0, 80)}...`);
        
        if (data.source === 'knowledge_base') {
            console.log(`   🎉 SUCCESS: Chatbot is using knowledge base!`);
        } else {
            console.log(`   ⚠️  WARNING: Chatbot is using Gemini instead of KB`);
        }
        
    } catch (error) {
        console.log(`   ❌ Chat test failed: ${error.message}`);
    }
    
    // Test 4: Test with non-KB question
    console.log("\n4. Testing with non-KB question...");
    try {
        const response = await fetch(`${baseURL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: "tell me a joke" })
        });
        
        const data = await response.json();
        console.log(`   ✅ Response received`);
        console.log(`   📍 Source: ${data.source}`);
        console.log(`   🎯 KB Match: ${data.kbMatch}`);
        
        if (data.source === 'gemini') {
            console.log(`   ✅ CORRECT: Using Gemini for non-KB question`);
        } else {
            console.log(`   ❌ ERROR: Should use Gemini for jokes`);
        }
        
    } catch (error) {
        console.log(`   ❌ Test failed: ${error.message}`);
    }
    
    console.log("\n✅ Diagnostic test complete!");
}

runDiagnostics();