import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';

async function testQuery(query, expectedSourcePart) {
    console.log(`\n🧪 Testing Query: "${query}"`);
    try {
        const res = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: query })
        });

        const data = await res.json();
        console.log(`   Response Status: ${res.status}`);
        console.log(`   Source: ${data.source}`);
        console.log(`   Answer Preview: ${data.answer?.substring(0, 100)}...`);

        if (data.source && data.source.includes(expectedSourcePart)) {
            console.log(`   ✅ SUCCESS: Source contained "${expectedSourcePart}"`);
        } else {
            console.log(`   ❌ FAILURE: Expected source to contain "${expectedSourcePart}", got "${data.source}"`);
        }
        return data;
    } catch (err) {
        console.error(`   ❌ ERROR: ${err.message}`);
        return null;
    }
}

async function runTests() {
    console.log(`🚀 Starting Smart Chat Verification...`);

    // 1. Text Health
    try {
        const health = await fetch(`${BASE_URL}/health`).then(r => r.json());
        console.log(`✅ Health Check: ${health.status}`);
    } catch (e) {
        console.error(`❌ Health Check Failed: Is server running?`);
        process.exit(1);
    }

    // 2. Test KB Query (Should be synthesized)
    // "How do I apply" is in KB.
    await testQuery("How do I apply for admission?", "knowledge_base+ai");

    // 3. Test General Query (Should be AI only)
    await testQuery("What is 2+2?", "gemini");

    // 4. Test Web/Unknown Query (Depends on keys, but should at least return AI or Web)
    // "current weather in Kampala" usually triggers non-kb.
    // await testQuery("What is the current weather in Kampala?", "ai");

    console.log(`\n🏁 Tests Complete.`);
}

runTests();
