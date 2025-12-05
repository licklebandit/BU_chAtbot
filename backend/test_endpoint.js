// backend/test_endpoint.js
import http from 'http';

const testQueries = [
    "where is the library?",
    "how do I apply?",
    "how much are fees?",
    "tell me a joke about university",
    "hello"
];

async function testQuery(query) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ q: query });
        
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing Chat Endpoint...\n');
    
    for (const query of testQueries) {
        try {
            console.log(`Query: "${query}"`);
            const result = await testQuery(query);
            console.log(`  Source: ${result.source}`);
            console.log(`  KB Match: ${result.kbMatch}`);
            console.log(`  Answer: ${result.answer.substring(0, 100)}...\n`);
            
            // Wait a bit between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}\n`);
        }
    }
}

runTests();