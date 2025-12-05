// backend/final-test.js
import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000/api/chat';

const testCases = [
  { question: "admission requirements", expected: "knowledge_base" },
  { question: "tuition fees", expected: "knowledge_base" },
  { question: "courses offered", expected: "knowledge_base" },
  { question: "library hours", expected: "knowledge_base" },
  { question: "contact information", expected: "knowledge_base" },
  { question: "who is the vc", expected: "knowledge_base" },
  { question: "tell me a joke", expected: "gemini" },
  { question: "what is the meaning of life", expected: "gemini" },
  { question: "hello", expected: "gemini" }
];

console.log("🎯 FINAL CHATBOT VERIFICATION TEST");
console.log("==================================\n");

async function runTests() {
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    console.log(`\n🔍 Test: "${test.question}"`);
    console.log(`   Expected source: ${test.expected}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: test.question })
      });
      
      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      console.log(`   ✅ Response received (${responseTime}ms)`);
      console.log(`   📍 Actual source: ${data.source}`);
      console.log(`   🎯 KB Match: ${data.kbMatch}`);
      
      if (data.source === test.expected) {
        console.log(`   🎉 PASS: Correctly used ${test.expected}`);
        passed++;
        
        // Show response time analysis
        if (data.source === 'knowledge_base' && responseTime > 100) {
          console.log(`   ⚠️  Note: KB response took ${responseTime}ms (should be < 100ms)`);
        } else if (data.source === 'knowledge_base') {
          console.log(`   ⚡ Excellent: KB response in ${responseTime}ms (fast!)`);
        }
      } else {
        console.log(`   ❌ FAIL: Expected ${test.expected}, got ${data.source}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("\n📊 TEST SUMMARY");
  console.log("==============");
  console.log(`Total tests: ${testCases.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${Math.round((passed/testCases.length)*100)}%`);
  
  if (failed === 0) {
    console.log("\n🎉🎉🎉 ALL TESTS PASSED! CHATBOT IS WORKING PERFECTLY! 🎉🎉🎉");
    console.log("\n✅ Knowledge base searches work");
    console.log("✅ Gemini API fallback works");
    console.log("✅ RAG_MODE=kb-first is configured correctly");
  } else {
    console.log("\n⚠️  Some tests failed. Check the errors above.");
  }
}

runTests();