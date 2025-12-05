// backend/test_improvements.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the intent classifier and question variations
import { detectIntent, isMixedQuery, classifyIntent, getIntentPriority } from './utils/intentClassifier.js';
import { isVariationOf, getVariationsForKeyword } from './utils/questionVariations.js';

// Load knowledge base
function loadKnowledgeBase() {
    try {
        const kbPath = path.join(__dirname, 'data', 'knowledge.json');
        const data = fs.readFileSync(kbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("❌ Error loading knowledge base:", error.message);
        return [];
    }
}

// Enhanced search function (simplified version for testing)
function testSearchInKnowledgeBase(query, knowledgeBase) {
    const cleanQuery = query.toLowerCase().trim();
    
    console.log(`\n🔍 Testing query: "${query}"`);
    console.log(`   Clean query: "${cleanQuery}"`);
    
    // Step 1: Intent Analysis
    const intentResult = detectIntent(query);
    console.log(`   🧠 Intent: ${intentResult.intent} (${intentResult.type}, confidence: ${intentResult.confidence.toFixed(2)})`);
    console.log(`   📊 Should use Gemini: ${intentResult.shouldUseGemini}`);
    
    // Step 2: Check for mixed queries
    const isMixed = isMixedQuery(query);
    console.log(`   🎭 Is mixed query: ${isMixed}`);
    
    // Step 3: Test variation matching
    console.log(`   🔄 Testing variation matching...`);
    let foundViaVariation = false;
    let variationMatch = null;
    
    for (const item of knowledgeBase) {
        if (!item.keyword) continue;
        
        // Test if query is a variation of the keyword
        if (isVariationOf(cleanQuery, item.keyword)) {
            foundViaVariation = true;
            variationMatch = item;
            console.log(`      ✅ Variation match: "${query}" → "${item.keyword}"`);
            break;
        }
    }
    
    // Step 4: Test synonyms matching
    console.log(`   📝 Testing synonyms matching...`);
    let foundViaSynonym = false;
    let synonymMatch = null;
    
    for (const item of knowledgeBase) {
        if (!item.keyword || !item.synonyms) continue;
        
        for (const synonym of item.synonyms) {
            if (cleanQuery.includes(synonym.toLowerCase()) || synonym.toLowerCase().includes(cleanQuery)) {
                foundViaSynonym = true;
                synonymMatch = item;
                console.log(`      ✅ Synonym match: "${synonym}" → "${item.keyword}"`);
                break;
            }
        }
        if (foundViaSynonym) break;
    }
    
    // Step 5: Test direct keyword matching
    console.log(`   🔑 Testing direct keyword matching...`);
    let foundDirect = false;
    let directMatch = null;
    
    for (const item of knowledgeBase) {
        if (!item.keyword) continue;
        
        const keyword = item.keyword.toLowerCase();
        if (cleanQuery.includes(keyword) || keyword.includes(cleanQuery)) {
            foundDirect = true;
            directMatch = item;
            console.log(`      ✅ Direct match: "${item.keyword}"`);
            break;
        }
    }
    
    // Step 6: Test word-by-word matching
    console.log(`   ✨ Testing word-by-word matching...`);
    const stopWords = ['what', 'where', 'when', 'who', 'how', 'why', 'the', 'a', 'an', 'and', 'or', 'but'];
    const queryWords = cleanQuery.split(/\s+/)
        .filter(word => word.length > 1 && !stopWords.includes(word))
        .filter(word => !word.includes('?'));
    
    let bestWordMatch = null;
    let bestWordScore = 0;
    
    for (const item of knowledgeBase) {
        if (!item.keyword || !item.answer) continue;
        
        const keyword = item.keyword.toLowerCase();
        const answer = item.answer.toLowerCase();
        const combinedText = keyword + ' ' + answer;
        
        let score = 0;
        for (const word of queryWords) {
            if (keyword.includes(word)) score += 10;
            if (answer.includes(word)) score += 5;
            if (item.synonyms) {
                for (const synonym of item.synonyms) {
                    if (synonym.toLowerCase().includes(word)) score += 8;
                }
            }
        }
        
        if (score > bestWordScore) {
            bestWordScore = score;
            bestWordMatch = item;
        }
    }
    
    if (bestWordMatch && bestWordScore > 0) {
        console.log(`      ✅ Word match: "${bestWordMatch.keyword}" (score: ${bestWordScore})`);
    }
    
    // Step 7: Summary
    console.log(`\n📊 SUMMARY for "${query}":`);
    console.log(`   Direct match: ${foundDirect ? '✅ ' + directMatch?.keyword : '❌'}`);
    console.log(`   Synonym match: ${foundViaSynonym ? '✅ ' + synonymMatch?.keyword : '❌'}`);
    console.log(`   Variation match: ${foundViaVariation ? '✅ ' + variationMatch?.keyword : '❌'}`);
    console.log(`   Word match: ${bestWordScore > 15 ? '✅ ' + bestWordMatch?.keyword + ` (score: ${bestWordScore})` : '❌'}`);
    console.log(`   Recommendation: ${intentResult.shouldUseGemini ? 'Use Gemini' : 'Use Knowledge Base'}`);
    
    // Return the best match
    if (foundDirect) return directMatch;
    if (foundViaSynonym) return synonymMatch;
    if (foundViaVariation) return variationMatch;
    if (bestWordScore > 15) return bestWordMatch;
    
    return null;
}

// Main test function
async function runTests() {
    console.log("🎓 BUGEMA UNIVERSITY CHATBOT IMPROVEMENTS TEST");
    console.log("=============================================\n");
    
    // Load knowledge base
    const knowledgeBase = loadKnowledgeBase();
    console.log(`📚 Loaded ${knowledgeBase.length} knowledge base entries`);
    console.log(`📝 Entries with synonyms: ${knowledgeBase.filter(item => item.synonyms && item.synonyms.length > 0).length}`);
    
    // Test queries
    const testQueries = [
        // Variations of "where is the library?"
        "where is the library?",
        "library location",
        "where can I find the library?",
        "directions to library",
        "where's the library at?",
        "library whereabouts",
        "where to find books",
        "book location",
        
        // Variations of "admission requirements"
        "how do I apply?",
        "what do I need for admission?",
        "entry requirements",
        "admission criteria",
        "how to get admitted",
        "what are the requirements to join?",
        
        // Variations of "tuition fees"
        "how much are fees?",
        "cost of study",
        "fee payment",
        "what's the price?",
        "tuition cost",
        "how much to pay",
        
        // Variations of "courses offered"
        "what can I study?",
        "available programs",
        "study options",
        "majors available",
        "what degrees do you offer?",
        
        // Variations of "contact information"
        "how to contact university",
        "phone number",
        "email address",
        "university address",
        "how to reach bugema",
        
        // Variations of "library hours"
        "when is library open?",
        "library opening hours",
        "library schedule",
        "what time does library close?",
        
        // Mixed queries (should go to Gemini)
        "tell me about fees and also tell a joke",
        "where is library and what's the weather?",
        "admission requirements and a funny story",
        
        // Non-KB queries (should go to Gemini)
        "hello",
        "how are you?",
        "tell me a joke",
        "what's the weather like?",
        "what can you do?",
        
        // Complex queries
        "I need help with admission to bugema university",
        "can you tell me about hostel accommodation and fees?",
        "what are the requirements to apply for scholarships?",
        "how do i get to bensdoff hostel?"
    ];
    
    console.log("\n🧪 TESTING QUERY MATCHING IMPROVEMENTS");
    console.log("=====================================\n");
    
    let kbMatches = 0;
    let geminiQueries = 0;
    let testResults = [];
    
    for (const query of testQueries) {
        const result = testSearchInKnowledgeBase(query, knowledgeBase);
        
        const intentResult = detectIntent(query);
        const shouldUseKB = !intentResult.shouldUseGemini && result !== null;
        
        testResults.push({
            query,
            matched: result ? result.keyword : null,
            intent: intentResult.intent,
            shouldUseKB,
            confidence: intentResult.confidence
        });
        
        if (shouldUseKB) {
            kbMatches++;
            console.log(`   ✅ Should use KB: "${query}"`);
        } else {
            geminiQueries++;
            console.log(`   🔵 Should use Gemini: "${query}"`);
        }
    }
    
    // Summary
    console.log("\n📈 TEST SUMMARY");
    console.log("===============");
    console.log(`Total queries tested: ${testQueries.length}`);
    console.log(`KB matches: ${kbMatches} (${Math.round((kbMatches / testQueries.length) * 100)}%)`);
    console.log(`Gemini queries: ${geminiQueries} (${Math.round((geminiQueries / testQueries.length) * 100)}%)`);
    
    // Test intent classifier separately
    console.log("\n🎯 INTENT CLASSIFIER TEST");
    console.log("========================");
    
    const intentTestQueries = [
        "hello",
        "admission requirements",
        "how much are fees?",
        "tell me a joke about university",
        "library location please",
        "what's the weather like at bugema?"
    ];
    
    for (const query of intentTestQueries) {
        const intent = classifyIntent(query);
        const priority = getIntentPriority(intent.intent);
        console.log(`"${query}" → Intent: ${intent.intent}, Priority: ${priority}, Use Gemini: ${intent.shouldUseGemini}`);
    }
    
    // Test variation matching
    console.log("\n🔄 VARIATION MATCHING TEST");
    console.log("==========================");
    
    const variationTests = [
        { query: "how to apply", keyword: "admission requirements" },
        { query: "cost of study", keyword: "tuition fees" },
        { query: "where is library", keyword: "library location" },
        { query: "phone number", keyword: "contact information" },
        { query: "when is library open", keyword: "library hours" }
    ];
    
    for (const test of variationTests) {
        const isVariation = isVariationOf(test.query, test.keyword);
        console.log(`"${test.query}" is variation of "${test.keyword}": ${isVariation ? '✅' : '❌'}`);
    }
    
    // Show some statistics
    console.log("\n📊 KNOWLEDGE BASE STATISTICS");
    console.log("===========================");
    
    const categories = {};
    knowledgeBase.forEach(item => {
        const cat = item.category || 'uncategorized';
        categories[cat] = (categories[cat] || 0) + 1;
    });
    
    console.log("Categories:");
    for (const [category, count] of Object.entries(categories)) {
        console.log(`  ${category}: ${count} entries`);
    }
    
    // Show entries with most synonyms
    const entriesWithSynonyms = knowledgeBase
        .filter(item => item.synonyms && item.synonyms.length > 0)
        .sort((a, b) => b.synonyms.length - a.synonyms.length)
        .slice(0, 5);
    
    console.log("\n🏆 Top entries with most synonyms:");
    entriesWithSynonyms.forEach(item => {
        console.log(`  "${item.keyword}": ${item.synonyms.length} synonyms`);
    });
    
    // Recommendations
    console.log("\n💡 RECOMMENDATIONS");
    console.log("=================");
    
    // Check for entries without synonyms
    const entriesWithoutSynonyms = knowledgeBase.filter(item => !item.synonyms || item.synonyms.length === 0);
    if (entriesWithoutSynonyms.length > 0) {
        console.log(`⚠️  Found ${entriesWithoutSynonyms.length} entries without synonyms:`);
        entriesWithoutSynonyms.slice(0, 5).forEach(item => {
            console.log(`   - "${item.keyword}"`);
        });
        if (entriesWithoutSynonyms.length > 5) {
            console.log(`   ... and ${entriesWithoutSynonyms.length - 5} more`);
        }
    } else {
        console.log("✅ All entries have synonyms!");
    }
    
    // Check intent coverage
    const allIntents = new Set();
    testResults.forEach(result => {
        if (result.intent !== 'unknown') {
            allIntents.add(result.intent);
        }
    });
    
    console.log(`\n🎯 Detected ${allIntents.size} different intents in test queries:`);
    console.log(`   ${Array.from(allIntents).join(', ')}`);
    
    console.log("\n✅ Testing completed!");
}

// Run tests
runTests().catch(console.error);