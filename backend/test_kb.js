// test_kb.js
import fetch from 'node-fetch';

console.log('🚀 Starting Knowledge Base Test...\n');

// Questions to test
const testQuestions = [
    'how do i reach bensdoff',
    'How do i get admissions of Bugema university?',
    'Who is the current vice chancellor',
    'Where is bensdoff?',
    'What courses do you offer?',
    'Tell me about tuition fees',
    'Who is the warden bensdoff'
];

async function testEndpoint(endpoint, question) {
    try {
        console.log(`📝 Testing: "${question}"`);
        console.log(`🔗 Endpoint: ${endpoint}`);
        
        const response = await fetch(`http://localhost:8000${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ q: question })
        });
        
        console.log(`✅ Status: ${response.status}`);
        
        if (!response.ok) {
            console.log(`❌ HTTP Error: ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();
        console.log('📄 Response:');
        console.log(JSON.stringify(data, null, 2));
        console.log('─'.repeat(80) + '\n');
        
        return data;
        
    } catch (error) {
        console.error(`❌ Network Error: ${error.message}`);
        console.log('   Make sure your server is running on port 8000!\n');
        return null;
    }
}

async function runAllTests() {
    console.log('⚠️  Make sure your server is running first! (npm run dev)\n');
    console.log('⏳ Waiting 2 seconds for server to be ready...\n');
    
    // Small delay to ensure server is ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // First, test the NEW knowledge base endpoint
    console.log('='.repeat(80));
    console.log('1️⃣ TESTING NEW KNOWLEDGE BASE ENDPOINT: /api/test/test');
    console.log('='.repeat(80));
    
    for (const question of testQuestions) {
        await testEndpoint('/api/test/test', question);
    }
    
    // Then test the main chat endpoint
    console.log('='.repeat(80));
    console.log('2️⃣ TESTING MAIN CHAT ENDPOINT: /api/chat');
    console.log('='.repeat(80));
    
    for (const question of testQuestions) {
        await testEndpoint('/api/chat', question);
    }
    
    console.log('✅ All tests completed!');
}

// Run the tests
runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});