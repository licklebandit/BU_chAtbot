// test_direct.js - Direct test without server changes
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load knowledge base directly
const knowledgePath = path.join(__dirname, 'data/knowledge.json');

console.log('🧪 Direct Knowledge Base Test');
console.log('='.repeat(60));

if (!fs.existsSync(knowledgePath)) {
    console.error(`❌ knowledge.json not found at: ${knowledgePath}`);
    process.exit(1);
}

const knowledgeData = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
console.log(`✅ Loaded ${knowledgeData.length} KB items\n`);

// Test queries
const testQueries = [
    'how do i reach bensdoff',
    'How do i get admissions of Bugema university?',
    'Who is the current vice chancellor',
    'Where is bensdoff?',
    'What courses do you offer?',
    'Tell me about tuition fees',
    'Who is the warden bensdoff'
];

function searchKnowledge(query) {
    const cleanQuery = query.toLowerCase().trim();
    
    console.log(`\n🔍 Searching for: "${query}"`);
    console.log(`   Clean query: "${cleanQuery}"`);
    
    // 1. Exact match
    for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        if (keyword === cleanQuery) {
            console.log(`✅ EXACT MATCH: "${item.keyword}"`);
            return item.answer;
        }
    }
    
    // 2. Partial match
    for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        if (keyword.includes(cleanQuery) || cleanQuery.includes(keyword)) {
            console.log(`✅ PARTIAL MATCH: "${item.keyword}"`);
            return item.answer;
        }
    }
    
    // 3. Word match
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
    let bestMatch = null;
    let bestScore = 0;
    
    for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        let score = 0;
        
        for (const word of words) {
            if (keyword.includes(word)) {
                score++;
            }
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }
    
    if (bestMatch && bestScore > 0) {
        console.log(`✅ WORD MATCH: "${bestMatch.keyword}" (score: ${bestScore}/${words.length})`);
        return bestMatch.answer;
    }
    
    console.log(`❌ NO MATCH FOUND`);
    return null;
}

// Run tests
console.log('📚 Available keywords in knowledge base:');
knowledgeData.forEach((item, i) => {
    console.log(`  ${i + 1}. "${item.keyword}"`);
});

console.log('\n' + '='.repeat(60));
console.log('RUNNING TESTS:');
console.log('='.repeat(60));

for (const query of testQueries) {
    const answer = searchKnowledge(query);
    if (answer) {
        console.log(`📝 ANSWER: ${answer}`);
    } else {
        console.log(`📝 ANSWER: NO MATCH FOUND`);
    }
    console.log('─'.repeat(60));
}