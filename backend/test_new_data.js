
import { searchKnowledge } from './utils/searchKnowledge.js';

async function testNewData() {
    console.log("🧪 Testing retrieval of new knowledge items...");

    const queries = [
        "Bugema University Anthem",
        "Uganda National Anthem",
        "Higher Education Access Certificate",
        "Contact Bugema University",
        "History of Bugema"
    ];

    for (const query of queries) {
        console.log(`\n🔍 Query: "${query}"`);
        const result = await searchKnowledge(query);
        if (result) {
            console.log(`✅ MATCH FOUND!`);
            console.log(`Answer preview: ${result.substring(0, 100).replace(/\n/g, ' ')}...`);
        } else {
            console.log(`❌ NO MATCH FOUND`);
        }
    }
}

testNewData().catch(console.error);
