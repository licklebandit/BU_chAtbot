// backend/utils/searchKnowledge.js - UPDATED
import Knowledge from "../models/Knowledge.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import utilities
import { detectIntent, isMixedQuery, getRecommendedCategories } from "./intentClassifier.js";
import { isVariationOf } from "./questionVariations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Search the knowledge base with ENHANCED matching
 */
export async function searchKnowledge(query, knowledgeItems = null) {
    if (!query || typeof query !== 'string') return "";
    
    const cleanQuery = query.toLowerCase().trim();
    console.log(`🔍 [searchKnowledge] Searching for: "${cleanQuery}"`);
    
    let items = knowledgeItems;
    
    // If no items provided, load from knowledge.json
    if (!items || items.length === 0) {
        items = await loadKnowledgeFromJSON();
    }
    
    if (!items || items.length === 0) {
        console.log("❌ No knowledge items available");
        return "";
    }
    
    // Step 1: Intent Analysis
    const intentResult = detectIntent(query);
    console.log(`   🧠 Intent: ${intentResult.intent} (${intentResult.type}, confidence: ${intentResult.confidence.toFixed(2)})`);
    
    // If intent says use Gemini, skip KB
    if (intentResult.shouldUseGemini) {
        console.log(`   ⚠️  Intent analysis recommends skipping KB: ${intentResult.reason}`);
        return "";
    }
    
    // Check for mixed queries
    if (isMixedQuery(query)) {
        console.log(`   ⚠️  Mixed query detected - skipping KB search`);
        return "";
    }
    
    // Convert items to standardized format
    const standardizedItems = items.map(item => ({
        keyword: item.question || item.keyword || '',
        answer: item.answer || '',
        category: item.category || "academic",
        tags: item.tags || [],
        synonyms: item.synonyms || []
    }));
    
    // Use the enhanced search logic
    const result = enhancedSearch(cleanQuery, standardizedItems, intentResult);
    
    if (result) {
        console.log(`✅ [searchKnowledge] Found match: "${result.keyword}"`);
        return result.answer;
    }
    
    console.log("❌ [searchKnowledge] No matches found");
    return "";
}

/**
 * Enhanced search with multi-level scoring
 */
function enhancedSearch(query, items, intentResult) {
    const cleanQuery = query.toLowerCase().trim();
    
    // Improved tokenization
    const stopWords = ['what', 'where', 'when', 'who', 'how', 'why', 'which', 
                      'is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 
                      'could', 'would', 'should', 'may', 'might', 'must', 
                      'the', 'a', 'an', 'and', 'or', 'but', 'so', 'for', 
                      'nor', 'yet', 'at', 'by', 'from', 'in', 'of', 'on', 
                      'to', 'with', 'as', 'into', 'like', 'than', 'that', 
                      'this', 'these', 'those', 'please', 'tell', 'me', 
                      'about', 'give', 'information', 'regarding'];
    
    const importantWords = ['library', 'admission', 'fee', 'course', 'program', 
                           'contact', 'hostel', 'scholarship', 'registration', 
                           'exam', 'graduation', 'portal', 'medical', 'international', 
                           'vc', 'warden', 'bensdoff', 'bugema', 'university', 
                           'campus', 'student', 'location', 'hours', 'time', 
                           'phone', 'email', 'address'];
    
    const queryWords = cleanQuery
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => {
            if (word.length < 2) return false;
            if (importantWords.includes(word)) return true;
            return !stopWords.includes(word);
        })
        .map(word => {
            // Handle common variations
            if (word === 'libraries') return 'library';
            if (word === 'fees') return 'fee';
            if (word === 'courses') return 'course';
            if (word === 'programs') return 'program';
            if (word === 'hostels') return 'hostel';
            if (word === 'scholarships') return 'scholarship';
            if (word === 'exams') return 'exam';
            if (word === 'students') return 'student';
            return word;
        });
    
    console.log(`   📝 Query words: ${queryWords.join(', ')}`);
    
    // Multi-level scoring system
    let bestMatch = null;
    let bestScore = 0;
    
    for (const item of items) {
        if (!item.keyword || !item.answer) continue;
        
        const keyword = item.keyword.toLowerCase().trim();
        const answer = item.answer.toLowerCase();
        
        let score = 0;
        
        // Level 1: Exact matches (highest priority)
        if (keyword === cleanQuery) {
            score += 100;
        }
        
        // Level 2: Contains matches
        if (cleanQuery.includes(keyword)) {
            score += 80;
        }
        if (keyword.includes(cleanQuery) && cleanQuery.length > 3) {
            score += 70;
        }
        
        // Level 3: Synonym matches
        const synonyms = item.synonyms || [];
        for (const synonym of synonyms) {
            const synLower = synonym.toLowerCase();
            if (cleanQuery.includes(synLower)) {
                score += 60;
                break;
            }
        }
        
        // Level 4: Variation matching
        if (isVariationOf(cleanQuery, keyword)) {
            score += 50;
        }
        
        // Level 5: Word-by-word matching
        for (const qWord of queryWords) {
            if (qWord.length < 2) continue;
            
            if (keyword.includes(qWord)) {
                score += 15;
            }
            
            for (const synonym of synonyms) {
                if (synonym.toLowerCase().includes(qWord)) {
                    score += 12;
                    break;
                }
            }
            
            if (answer.includes(qWord)) {
                score += 8;
            }
        }
        
        // Level 6: Intent-based bonus
        if (intentResult.type === 'university') {
            const recommendedCats = getRecommendedCategories(intentResult);
            if (recommendedCats.length > 0 && item.category) {
                if (recommendedCats.includes(item.category.toLowerCase())) {
                    score += 25;
                }
            }
        }
        
        // Level 7: Length bonus
        if (queryWords.length >= 3 && score > 20) {
            score += 15;
        }
        
        // Store the best match
        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }
    
    // Dynamic threshold calculation
    let minScore = 20;
    if (queryWords.length === 1) {
        minScore = 25;
    } else if (queryWords.length >= 3) {
        minScore = 30;
    }
    
    if (intentResult.confidence > 0.7) {
        minScore = 15;
    }
    
    console.log(`   📊 Best score: ${bestScore}, Minimum required: ${minScore}`);
    
    if (bestMatch && bestScore >= minScore) {
        return bestMatch;
    }
    
    // Try contextual matching as fallback
    if (intentResult.type === 'university' && intentResult.intent !== 'unknown') {
        const recommendedCats = getRecommendedCategories(intentResult);
        console.log(`   🔄 Trying contextual matching for categories: ${recommendedCats.join(', ')}`);
        
        for (const item of items) {
            if (!item.category) continue;
            
            const itemCat = item.category.toLowerCase();
            if (recommendedCats.some(cat => itemCat.includes(cat) || cat.includes(itemCat))) {
                console.log(`   ✅ Contextual match: "${item.keyword}" (category: ${item.category})`);
                return item;
            }
        }
    }
    
    return null;
}

/**
 * Load knowledge from JSON file
 */
async function loadKnowledgeFromJSON() {
    const jsonPath = path.join(__dirname, '../data/knowledge.json');
    
    if (!fs.existsSync(jsonPath)) {
        console.log(`⚠️ knowledge.json not found at: ${jsonPath}`);
        return [];
    }
    
    try {
        const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const items = rawData.map(item => ({
            question: item.keyword,
            keyword: item.keyword,
            answer: item.answer,
            tags: item.tags || [],
            category: item.category || "academic",
            synonyms: item.synonyms || [],
            priority: item.priority || 2
        }));
        
        console.log(`📚 Loaded ${items.length} items from knowledge.json`);
        return items;
    } catch (error) {
        console.error("❌ Error loading knowledge.json:", error);
        return [];
    }
}

/**
 * Simple search for backward compatibility
 */
export async function simpleSearch(query, items = null) {
    if (!query) return "";
    
    const cleanQuery = query.toLowerCase().trim();
    let knowledgeItems = items;
    
    if (!knowledgeItems || knowledgeItems.length === 0) {
        knowledgeItems = await loadKnowledgeFromJSON();
    }
    
    // 1. EXACT MATCH
    for (const item of knowledgeItems) {
        const keyword = (item.question || item.keyword || '').toLowerCase().trim();
        if (keyword === cleanQuery) {
            return item.answer;
        }
    }
    
    // 2. CONTAINS MATCH
    for (const item of knowledgeItems) {
        const keyword = (item.question || item.keyword || '').toLowerCase().trim();
        if (keyword.includes(cleanQuery) || cleanQuery.includes(keyword)) {
            return item.answer;
        }
    }
    
    // 3. WORD MATCHING
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2);
    if (queryWords.length > 0) {
        let bestMatch = null;
        let bestScore = 0;
        
        for (const item of knowledgeItems) {
            const keyword = (item.question || item.keyword || '').toLowerCase();
            const answer = (item.answer || '').toLowerCase();
            const combined = `${keyword} ${answer}`;
            
            let score = 0;
            for (const word of queryWords) {
                if (combined.includes(word)) score++;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }
        
        if (bestMatch && bestScore > 0 && bestScore >= queryWords.length * 0.5) {
            return bestMatch.answer;
        }
    }
    
    return "";
}

/**
 * Search with fallback for backward compatibility
 */
export async function searchKnowledgeWithFallback(query, knowledge = []) {
    return await searchKnowledge(query, knowledge);
}

// Helper function to calculate string similarity (0-1)
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Check if shorter is substring of longer
    if (longer.includes(shorter)) return 1.0;
    
    // Simple character overlap
    const set1 = new Set(str1.split(''));
    const set2 = new Set(str2.split(''));
    let intersection = 0;
    
    for (const char of set1) {
        if (set2.has(char)) intersection++;
    }
    
    const union = set1.size + set2.size - intersection;
    return union === 0 ? 0 : intersection / union;
}

/**
 * Quick test function
 */
export async function testSearch() {
    console.log("🧪 Testing searchKnowledge function...");
    
    const testQueries = [
        "where is the library?",
        "how do I apply?",
        "tuition fees",
        "hello"
    ];
    
    for (const query of testQueries) {
        console.log(`\nTesting: "${query}"`);
        const result = await searchKnowledge(query);
        if (result) {
            console.log(`✅ Found: ${result.substring(0, 100)}...`);
        } else {
            console.log("❌ No match");
        }
    }
}