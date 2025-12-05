// backend/test_chat_endpoint.js
import http from 'http';

const testQueries = [
    "where is the library?",
    "library location",
    "how do I apply?",
    "admission requirements",
    "how much are fees?",
    "tell me about library and a joke",
    "hello",
    "what are the admission requirements for bugema university?"
];

async function testEndpoint(query) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ q: query });
        
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log("🌐 TESTING CHAT ENDPOINT\n");
    
    for (const query of testQueries) {
        try {
            console.log(`🔍 Testing: "${query}"`);
            const startTime = Date.now();
            const result = await testEndpoint(query);
            const responseTime = Date.now() - startTime;
            
            console.log(`   Source: ${result.source}`);
            console.log(`   KB Match: ${result.kbMatch}`);
            console.log(`   Response time: ${responseTime}ms`);
            console.log(`   Answer preview: ${result.answer.substring(0, 100)}...`);
            console.log();
            
            // Wait a bit between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`❌ Error testing "${query}":`, error.message);
        }
    }
    
    console.log("✅ All tests completed!");
}

// Check if server is running first
const checkServer = () => {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8000,
            path: '/health',
            method: 'GET'
        }, (res) => {
            resolve(res.statusCode === 200);
        });
        
        req.on('error', () => {
            resolve(false);
        });
        
        req.end();
    });
};

async function main() {
    console.log("Checking if server is running...");
    const isRunning = await checkServer();
    
    if (!isRunning) {
        console.log("❌ Server is not running. Please start it with: node server.js");
        return;
    }
    
    console.log("✅ Server is running. Starting tests...\n");
    await runTests();
}

main();