// backend/debug-search.js
import fs from "fs";
import path from "path";

const knowledgePath = path.join('data', 'knowledge.json');
const knowledgeBase = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));

console.log("🔍 DEBUG: Knowledge Base Search Analysis");
console.log("========================================\n");

console.log(`📚 Total entries: ${knowledgeBase.length}\n`);

// Test specific queries
const testQueries = [
    "library hours",
    "contact information",
    "where is the library?",
    "what are the library hours?",
    "how do I contact the university?",
    "library",
    "hours"
];

function debugSearch(query) {
    console.log(`\n🔍 Query: "${query}"`);
    const cleanQuery = query.toLowerCase().trim();
    
    // Show all KB entries that might match
    console.log("   Possible matches in KB:");
    
    let foundAny = false;
    for (const item of knowledgeBase) {
        if (!item.keyword) continue;
        
        const keyword = item.keyword.toLowerCase();
        const answer = item.answer.toLowerCase();
        
        // Check different matching strategies
        const matches = [
            { type: 'exact', match: keyword === cleanQuery },
            { type: 'contains', match: cleanQuery.includes(keyword) || keyword.includes(cleanQuery) },
            { type: 'word', match: cleanQuery.split(' ').some(word => 
                word.length > 2 && (keyword.includes(word) || answer.includes(word))
            )}
        ];
        
        const anyMatch = matches.some(m => m.match);
        
        if (anyMatch) {
            foundAny = true;
            console.log(`   ✅ "${item.keyword}"`);
            matches.forEach(m => {
                if (m.match) console.log(`      - ${m.type} match`);
            });
        }
    }
    
    if (!foundAny) {
        console.log("   ❌ No direct matches found");
        
        // Show what's actually in KB
        console.log("   Available library/contact entries:");
        knowledgeBase.forEach(item => {
            if (item.keyword.toLowerCase().includes('library') || 
                item.keyword.toLowerCase().includes('contact') ||
                item.keyword.toLowerCase().includes('hour')) {
                console.log(`      - "${item.keyword}"`);
            }
        });
    }
}

// Run debug for each query
testQueries.forEach(debugSearch);

// Show all KB entries
console.log("\n📋 ALL KNOWLEDGE BASE ENTRIES:");
console.log("=============================");
knowledgeBase.forEach((item, i) => {
    console.log(`${i + 1}. "${item.keyword}"`);
    console.log(`   Category: ${item.category}`);
    console.log(`   Tags: ${item.tags ? item.tags.join(', ') : 'none'}`);
    console.log(`   Preview: ${item.answer.substring(0, 60)}...`);
    console.log();
});