// test_chat.js - UPDATED VERSION
import fetch from 'node-fetch';

async function testEndpoint(endpoint, question) {
  try {
    console.log(`\n📝 Testing: "${question}"`);
    console.log(`🔗 Endpoint: ${endpoint}`);
    
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: question })
    });
    
    console.log(`✅ Status: ${response.status}`);
    
    // Try to parse JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`📄 Response:`);
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log(`📄 Response (text): ${text.slice(0, 200)}...`);
    }
    
    console.log('─'.repeat(50));
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    console.error(`   Make sure your server is running on port 8000!`);
  }
}

async function runTests() {
  console.log('🚀 Testing Chatbot Endpoints...');
  console.log('⏳ Ensure your server is running: npm run dev\n');
  
  // Wait 2 seconds to ensure server is ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test different questions
  const questions = [
    'how do i reach bensdoff',
    'How do i get admissions of Bugema university?',
    'Who is the current vice chancellor',
    'What courses do you offer?',
    'Tell me about tuition fees',
    'Where is bensdoff?'
  ];
  
  // Test main chat endpoint
  console.log('\n🔍 TESTING MAIN CHAT ENDPOINT: /api/chat');
  console.log('═'.repeat(50));
  
  for (const question of questions) {
    await testEndpoint('/api/chat', question);
  }
  
  // Test simple endpoint (if you've added it)
  console.log('\n🔍 TESTING SIMPLE ENDPOINT: /api/simple/simple');
  console.log('═'.repeat(50));
  
  for (const question of questions) {
    await testEndpoint('/api/simple/simple', question);
  }
  
  console.log('\n✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);