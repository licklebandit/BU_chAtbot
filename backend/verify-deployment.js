// backend/verify-deployment.js
import fs from "fs";
import path from "path";

console.log("🔍 Verifying Chatbot Deployment\n");
console.log("===============================\n");

// 1. Check .env file
console.log("1. Checking .env configuration:");
const envPath = path.join('.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasRagMode = envContent.includes('RAG_MODE=');
    const ragModeLine = envContent.split('\n').find(line => line.includes('RAG_MODE='));
    
    console.log(`   ✅ .env file exists`);
    console.log(`   📝 RAG_MODE setting: ${ragModeLine || 'Not found'}`);
    
    if (ragModeLine && ragModeLine.includes('kb-first')) {
        console.log(`   🎯 CORRECT: RAG_MODE is set to 'kb-first'`);
    } else if (ragModeLine && ragModeLine.includes('llm-only')) {
        console.log(`   ⚠️  WARNING: RAG_MODE is 'llm-only' - change to 'kb-first'!`);
    }
} else {
    console.log(`   ❌ .env file not found!`);
}

// 2. Check knowledge base
console.log("\n2. Checking knowledge base:");
const kbPath = path.join('data', 'knowledge.json');
if (fs.existsSync(kbPath)) {
    const kbData = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
    console.log(`   ✅ knowledge.json exists with ${kbData.length} entries`);
    
    // Check for essential questions
    const essential = ["admission requirements", "tuition fees", "courses offered"];
    const foundEssential = essential.filter(q => 
        kbData.some(item => item.keyword.toLowerCase().includes(q))
    );
    
    console.log(`   📊 Found ${foundEssential.length}/${essential.length} essential questions`);
    essential.forEach(q => {
        const found = kbData.some(item => item.keyword.toLowerCase().includes(q));
        console.log(`      ${found ? '✅' : '❌'} "${q}"`);
    });
} else {
    console.log(`   ❌ knowledge.json not found!`);
}

// 3. Check routes/chat.js
console.log("\n3. Checking chat.js implementation:");
const chatRoutePath = path.join('routes', 'chat.js');
if (fs.existsSync(chatRoutePath)) {
    const chatContent = fs.readFileSync(chatRoutePath, 'utf8');
    const hasKBSearch = chatContent.includes('searchKnowledgeBase');
    const hasDirectReturn = chatContent.includes('kbAnswer') && chatContent.includes('return');
    
    console.log(`   ✅ chat.js exists`);
    console.log(`   🔍 KB search function: ${hasKBSearch ? '✅ Present' : '❌ Missing'}`);
    console.log(`   🔍 Direct KB return: ${hasDirectReturn ? '✅ Present' : '❌ Missing'}`);
} else {
    console.log(`   ❌ chat.js not found!`);
}

// 4. Test server availability
console.log("\n4. Testing server connection:");
console.log("   🌐 Try: curl -X POST http://localhost:8000/api/chat/test-kb");
console.log("           -H \"Content-Type: application/json\"");
console.log("           -d '{\"q\": \"admission requirements\"}'");

console.log("\n5. Next steps to verify:");
console.log("   a. Restart your backend server");
console.log("   b. Test in your React frontend");
console.log("   c. Check browser console for 'source' field");
console.log("   d. Monitor backend logs for '✅ KB ANSWER FOUND' messages");

console.log("\n✅ Verification checklist complete!");