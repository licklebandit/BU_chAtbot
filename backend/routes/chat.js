// backend/routes/chat.js - CORRECTED VERSION
import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { getChatResponse } from "../utils/getChatResponse.js";

// Import utilities
import { detectIntent, isMixedQuery, getRecommendedCategories } from "../utils/intentClassifier.js";
import { isVariationOf } from "../utils/questionVariations.js";

const router = express.Router();

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------
// SIMPLE KNOWLEDGE BASE LOADER
// ---------------------------
let knowledgeBase = [];

function loadKnowledgeBase() {
    try {
        const kbPath = path.join(__dirname, '../data/knowledge.json');
        if (!fs.existsSync(kbPath)) {
            console.log("⚠️ knowledge.json not found at:", kbPath);
            knowledgeBase = [];
            return;
        }

        const data = fs.readFileSync(kbPath, 'utf8');
        knowledgeBase = JSON.parse(data);
        console.log(`✅ Loaded ${knowledgeBase.length} items from knowledge.json`);

    } catch (error) {
        console.error("❌ Error loading knowledge base:", error.message);
        knowledgeBase = [];
    }
}

// Load on startup
loadKnowledgeBase();

// ---------------------------
// ENHANCED KB SEARCH FUNCTION WITH INTENT RECOGNITION
// ---------------------------
function searchInKnowledgeBase(query) {
    if (!query || !knowledgeBase.length) {
        console.log("❌ KB search: No query or empty knowledge base");
        return null;
    }

    const cleanQuery = query.toLowerCase().trim();
    console.log(`🔍 KB Search: "${cleanQuery}"`);

    // Step 1: Intent Analysis
    const intentResult = detectIntent(query);
    console.log(`   🧠 Intent: ${intentResult.intent} (${intentResult.type}, confidence: ${intentResult.confidence.toFixed(2)})`);

    // If intent says use Gemini, skip KB
    if (intentResult.shouldUseGemini) {
        console.log(`   ⚠️  Intent analysis recommends Gemini: ${intentResult.reason}`);
        return null;
    }

    // Check for mixed queries
    if (isMixedQuery(query)) {
        console.log(`   ⚠️  Mixed query detected (contains both university and non-university elements)`);
        console.log(`   💡 Recommendation: Use Gemini for better handling`);
        return null;
    }

    // Step 2: Improved tokenization
    const stopWords = ['what', 'where', 'when', 'who', 'how', 'why', 'which',
        'is', 'are', 'was', 'were', 'do', 'does', 'did', 'can',
        'could', 'would', 'should', 'may', 'might', 'must',
        'the', 'a', 'an', 'and', 'or', 'but', 'so', 'for',
        'nor', 'yet', 'at', 'by', 'from', 'in', 'of', 'on',
        'to', 'with', 'as', 'into', 'like', 'than', 'that',
        'this', 'these', 'those', 'please', 'tell', 'me',
        'about', 'give', 'information', 'regarding'];

    // Keep important words like 'library', 'admission', etc.
    const importantWords = ['library', 'admission', 'fee', 'course', 'program',
        'contact', 'hostel', 'scholarship', 'registration',
        'exam', 'graduation', 'portal', 'medical', 'international',
        'vc', 'warden', 'bensdoff', 'bugema', 'university',
        'campus', 'student', 'location', 'hours', 'time',
        'phone', 'email', 'address', 'vice', 'chancellor'];

    const queryWords = cleanQuery
        .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
        .split(/\s+/)
        .filter(word => {
            if (word.length < 2) return false;
            // Keep important words even if they're in stopWords
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

    // If no meaningful words, but query is long, try fuzzy matching
    if (queryWords.length === 0 && cleanQuery.length > 10) {
        console.log(`   🔄 No meaningful words extracted, but query is long. Using advanced matching.`);
        queryWords.push(...cleanQuery.split(/\s+/).filter(w => w.length > 3));
    }

    // Step 3: Multi-level scoring system
    let bestMatch = null;
    let bestScore = 0;
    let bestMatchDetails = {};

    for (const item of knowledgeBase) {
        if (!item.keyword || !item.answer) continue;

        const keyword = item.keyword.toLowerCase().trim();
        const answer = item.answer.toLowerCase();

        // Get synonyms from knowledge base
        const synonyms = item.synonyms || [];
        const allSynonyms = [...synonyms, ...(item.tags || [])];

        let score = 0;
        const scoringDetails = {};

        // Level 1: Exact matches (highest priority)
        if (keyword === cleanQuery) {
            score += 100;
            scoringDetails.exactMatch = true;
        }

        // Level 2: Contains matches
        if (cleanQuery.includes(keyword)) {
            score += 80;
            scoringDetails.containsKeyword = true;
        }
        if (keyword.includes(cleanQuery) && cleanQuery.length > 3) {
            score += 70;
            scoringDetails.keywordContainsQuery = true;
        }

        // Level 3: Synonym matches
        for (const synonym of allSynonyms) {
            const synLower = synonym.toLowerCase();
            if (cleanQuery.includes(synLower)) {
                score += 60;
                scoringDetails.synonymMatch = synonym;
                break;
            }
        }

        // Level 4: Variation matching with question bonus
        if (isVariationOf(cleanQuery, keyword)) {
            score += 50;
            scoringDetails.variationMatch = true;

            // Bonus for stronger variation matches with question words
            const questionWords = ['where', 'when', 'how', 'what', 'who'];
            const keywordWords = keyword.split(/\s+/);

            let questionBonus = 0;
            for (const qWord of questionWords) {
                if (cleanQuery.includes(qWord) && keywordWords.some(kw =>
                    cleanQuery.includes(kw) || kw.includes(cleanQuery))) {
                    questionBonus += 10;
                }
            }
            score += questionBonus;
        }

        // Level 5: Word-by-word matching
        let wordScore = 0;
        for (const qWord of queryWords) {
            if (qWord.length < 2) continue;

            // Check in keyword
            if (keyword.includes(qWord)) {
                wordScore += 15;
                scoringDetails[`wordInKeyword_${qWord}`] = true;
            }

            // Check in synonyms
            for (const synonym of allSynonyms) {
                if (synonym.toLowerCase().includes(qWord)) {
                    wordScore += 12;
                    scoringDetails[`wordInSynonym_${qWord}`] = synonym;
                    break;
                }
            }

            // Check in answer
            if (answer.includes(qWord)) {
                wordScore += 8;
                scoringDetails[`wordInAnswer_${qWord}`] = true;
            }
        }

        score += wordScore;

        // Level 6: Phrase detection
        const keyPhrases = keyword.split(/\s+/).filter(w => w.length > 3);
        let phraseMatches = 0;
        for (const phrase of keyPhrases) {
            if (cleanQuery.includes(phrase)) {
                phraseMatches++;
            }
        }
        if (phraseMatches >= 2) {
            score += phraseMatches * 10;
            scoringDetails.phraseMatches = phraseMatches;
        }

        // Level 7: Intent-based bonus
        if (intentResult.type === 'university') {
            const recommendedCats = getRecommendedCategories(intentResult);
            if (recommendedCats.length > 0 && item.category) {
                if (recommendedCats.includes(item.category.toLowerCase())) {
                    score += 25;
                    scoringDetails.intentBonus = true;
                }
            }
        }

        // Level 8: Length bonus (longer queries matching are better)
        if (queryWords.length >= 3 && wordScore > 20) {
            score += 15;
            scoringDetails.lengthBonus = true;
        }

        // Store best match
        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
            bestMatchDetails = { ...scoringDetails, itemKeyword: keyword };

            console.log(`   🎯 New best: "${item.keyword}" (score: ${score})`);

            // Show scoring breakdown in debug mode
            if (process.env.NODE_ENV === 'development') {
                console.log(`      Details:`, Object.keys(scoringDetails).join(', '));
            }
        }
    }

    // Step 4: Dynamic threshold calculation
    let minScore = 20; // Base minimum

    // Adjust based on query characteristics
    if (queryWords.length === 1) {
        minScore = 25; // Single word needs stronger match
    } else if (queryWords.length >= 3) {
        minScore = 30; // Longer queries need good matches
    }

    // Adjust based on intent
    if (intentResult.confidence > 0.7) {
        minScore = 15; // High confidence intent, easier match
    }

    // Special handling for location queries
    if (cleanQuery.includes('where') && cleanQuery.includes('library')) {
        minScore = 15; // Lower threshold for "where is library"
    }

    console.log(`   📊 Minimum score required: ${minScore} (query length: ${queryWords.length}, intent confidence: ${intentResult.confidence.toFixed(2)})`);

    // Step 5: Return result if score is good enough
    if (bestMatch && bestScore >= minScore) {
        console.log(`✅ KB Match: "${bestMatch.keyword}" (score: ${bestScore})`);
        console.log(`   🏷️  Category: ${bestMatch.category || 'uncategorized'}`);
        console.log(`   🎯 Match type: ${Object.keys(bestMatchDetails).filter(k => k.includes('Match') || k.includes('Bonus')).join(', ')}`);

        return { answer: bestMatch.answer, keyword: bestMatch.keyword };
    } else if (bestMatch) {
        console.log(`   ⚠️  Score too low: ${bestScore} < ${minScore}`);

        // Special case: If we have a match with certain keywords, still return it
        const importantMatches = ['library location', 'contact information', 'admission requirements', 'vice', 'chancellor'];
        if (importantMatches.some(imp => bestMatch.keyword.toLowerCase().includes(imp.toLowerCase()))) {
            console.log(`   💡 Important topic match - overriding threshold`);
            return { answer: bestMatch.answer, keyword: bestMatch.keyword };
        }
    }

    // Step 6: Advanced fallback - contextual matching
    console.log(`   🔄 No direct match found, trying contextual matching...`);

    // Try to match based on intent
    if (intentResult.type === 'university' && intentResult.intent !== 'unknown') {
        const recommendedCats = getRecommendedCategories(intentResult);
        console.log(`   🎯 Intent-based search for categories: ${recommendedCats.join(', ')}`);

        for (const item of knowledgeBase) {
            if (!item.category) continue;

            const itemCat = item.category.toLowerCase();
            if (recommendedCats.some(cat => itemCat.includes(cat) || cat.includes(itemCat))) {
                console.log(`   ✅ Contextual match: "${item.keyword}" (category: ${item.category})`);
                return { answer: item.answer, keyword: item.keyword };
            }
        }
    }

    // Last resort: Word similarity fallback
    if (queryWords.length > 0) {
        const lastResortMap = {
            // Library-related
            'library': ['library location', 'library hours', 'contact information'],
            'book': ['library location', 'library hours'],
            'study': ['library location', 'library hours', 'courses offered'],

            // Contact-related
            'contact': ['contact information'],
            'phone': ['contact information'],
            'email': ['contact information'],
            'address': ['contact information', 'library location'],

            // General university
            'bugema': ['contact information', 'admission requirements', 'courses offered'],
            'university': ['contact information', 'admission requirements', 'courses offered'],

            // Admission-related
            'apply': ['admission requirements', 'How do i get admissions of Bugema university?'],
            'application': ['admission requirements', 'How do i get admissions of Bugema university?'],

            // Fees-related
            'cost': ['tuition fees'],
            'payment': ['tuition fees'],
            'price': ['tuition fees'],

            // Courses-related
            'study': ['courses offered'],
            'program': ['courses offered'],
            'degree': ['courses offered']
        };

        for (const qWord of queryWords) {
            if (lastResortMap[qWord]) {
                for (const possibleKeyword of lastResortMap[qWord]) {
                    for (const item of knowledgeBase) {
                        if (item.keyword.toLowerCase().includes(possibleKeyword.toLowerCase())) {
                            console.log(`   🔄 Fallback match: "${qWord}" → "${item.keyword}"`);
                            return { answer: item.answer, keyword: item.keyword };
                        }
                    }
                }
            }
        }
    }

    console.log("❌ No KB match found after all attempts");
    return null;
}

// ---------------------------
// MIDDLEWARE
// ---------------------------
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("_id name email");
    } catch (err) {
        console.error("JWT verification failed:", err.message);
    }
    next();
};

// ---------------------------
// MAIN CHAT ENDPOINT - OPTIMIZED LOGIC
// ---------------------------
router.post("/", authenticate, async (req, res) => {
    console.log("\n💬 ===== CHAT REQUEST (Smart Mode) =====");
    const { q, imageUrl } = req.body;

    if ((!q || q.trim() === "") && !imageUrl) {
        return res.status(400).json({ answer: "Please ask a question." });
    }

    console.log(`Question: "${q}"`);

    try {
        let context = "";
        let source = "ai";
        let kbMatch = false;

        // STEP 1: CHECK KNOWLEDGE BASE
        // We get the raw answer but DO NOT return it yet.
        const kbResult = searchInKnowledgeBase(q);

        if (kbResult && kbResult.answer) {
            console.log("✅ Found relevant info in Knowledge Base");
            // Include BOTH the matched question and the answer in context
            context = kbResult.answer;
            source = "knowledge_base+ai";
            kbMatch = true;
        } else {
            console.log("❌ No direct KB match found");
        }

        // STEP 2: IF NO KB MATCH, TRY WEB SEARCH
        // Simple intent check for search necessity
        const needsSearch = !kbMatch && q.length > 5 && !["hi", "hello", "hey", "thanks", "bye"].includes(q.toLowerCase().trim());

        if (needsSearch) {
            try {
                // Dynamic import to avoid issues if file doesn't exist
                const { webSearch } = await import("../utils/webSearch.js");
                console.log("🔍 Attempting Web Search...");
                const searchResults = await webSearch(q + " Bugema University"); // Force context for web search

                if (searchResults && searchResults.length > 0) {
                    console.log(`✅ Web search found ${searchResults.length} results`);
                    const webContext = searchResults.join("\n\n");
                    context += `\n\nWEB SEARCH RESULTS:\n${webContext}`;
                    source = "web_search+ai";
                } else {
                    console.log("❌ Web search yielded no results");
                }
            } catch (searchErr) {
                console.warn("⚠️ Web search failed or skipped:", searchErr.message);
            }
        }

        // STEP 3: GET CHAT HISTORY
        let history = [];

        // Option A: Logged-in user -> Fetch from DB
        if (req.user) {
            try {
                // Fetch recent chat history for this user
                const userChat = await Chat.findOne({ userId: req.user._id });
                if (userChat && userChat.messages) {
                    // Get last 6 messages (3 turns)
                    const recentMsgs = userChat.messages.slice(-6);
                    history = recentMsgs.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model', // Map 'assistant' to 'model' for Gemini
                        parts: [{ text: msg.text }]
                    }));
                }
            } catch (histErr) {
                console.warn("⚠️ Failed to fetch history:", histErr.message);
            }
        }
        // Option B: Guest/Client-provided history (if not logged in or as fallback)
        else if (req.body.history && Array.isArray(req.body.history)) {
            // Expecting frontend to send format: [{ role: 'user', text: '...' }]
            // We need to sanitize this to ensure safety and correct format
            history = req.body.history.map(h => ({
                role: h.role === 'assistant' ? 'model' : (h.role === 'model' ? 'model' : 'user'),
                parts: [{ text: h.text || h.content || "" }]
            })).slice(-6); // Limit to last 6 turns to check token usage
        }

        // STEP 4: GENERATE SYNTHESIZED RESPONSE
        console.log("🤖 Generating AI response with context & history...");

        let geminiAnswer = "";
        let responseTime = 0;

        try {
            const startTime = Date.now();

            // Pass the context and history to the synthesis function
            const { text, suggestions } = await getChatResponse(q, context, imageUrl, history);

            responseTime = Date.now() - startTime;
            geminiAnswer = text || "I couldn't generate a response.";
            console.log(`✅ Gemini response received in ${responseTime}ms`);

            if (suggestions && Array.isArray(suggestions)) {
                // Ensure unique suggestions
                const uniqueSuggestions = [...new Set(suggestions)];
                // Attach to response object - we use a local variable to pass to res.json later if needed
                // But wait, the res.json is below. We need to attach it there.
                req.smartSuggestions = uniqueSuggestions;
            }

        } catch (error) {
            console.error("Gemini API error:", error.message);

            // Fallback: If AI fails but we had a KB match, at least return that raw!
            if (kbMatch) {
                console.log("⚠️ AI failed, falling back to raw KB answer");
                geminiAnswer = kbResult.answer; // Fallback to raw
                source = "knowledge_base_fallback";
            } else {
                geminiAnswer = "I'm having trouble connecting to the AI service. Please try again later.";
            }
        }

        // Save to history if logged in
        if (req.user) {
            await saveToHistory(req.user._id, q, geminiAnswer, source);
        }

        res.json({
            answer: geminiAnswer,
            source: source,
            kbMatch: kbMatch,
            responseTime: `${responseTime}ms`,
            suggestedQuestions: req.smartSuggestions || []
        });

    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({
            answer: "Sorry, I encountered an error. Please try again.",
            source: "error",
            error: error.message
        });
    }
});

// ---------------------------
// TEST ENDPOINT - KB ONLY
// ---------------------------
router.post("/test-kb", (req, res) => {
    const { q } = req.body;

    if (!q) {
        return res.json({ error: "No query provided" });
    }

    console.log(`🧪 TEST KB: "${q}"`);

    const kbAnswer = searchInKnowledgeBase(q);

    if (kbAnswer) {
        res.json({
            success: true,
            query: q,
            answer: kbAnswer,
            source: "knowledge_base",
            kbMatch: true
        });
    } else {
        res.json({
            success: false,
            query: q,
            message: "No knowledge base match",
            source: "knowledge_base",
            kbMatch: false
        });
    }
});

// ---------------------------
// QUERY ANALYSIS ENDPOINT (for debugging)
// ---------------------------
router.post("/analyze-query", (req, res) => {
    const { q } = req.body;

    if (!q) {
        return res.json({ error: "No query provided" });
    }

    console.log(`🔬 ANALYZE QUERY: "${q}"`);

    const intentResult = detectIntent(q);
    const isMixed = isMixedQuery(q);
    const kbAnswer = searchInKnowledgeBase(q);

    res.json({
        query: q,
        analysis: {
            intent: intentResult.intent,
            intentType: intentResult.type,
            confidence: intentResult.confidence,
            shouldUseGemini: intentResult.shouldUseGemini,
            isMixedQuery: isMixed,
            reason: intentResult.reason,
            recommendation: kbAnswer ? "Use Knowledge Base" : "Use Gemini"
        },
        kbSearchResult: kbAnswer ? {
            found: true,
            matchedKeyword: knowledgeBase.find(item => item.answer === kbAnswer)?.keyword || "unknown",
            answerPreview: kbAnswer.substring(0, 150) + "..."
        } : {
            found: false
        }
    });
});

// ---------------------------
// KNOWLEDGE BASE STATS
// ---------------------------
router.get("/kb-stats", (req, res) => {
    try {
        // Count entries with synonyms
        const entriesWithSynonyms = knowledgeBase.filter(item => item.synonyms && item.synonyms.length > 0).length;

        res.json({
            success: true,
            stats: {
                totalEntries: knowledgeBase.length,
                entriesWithSynonyms: entriesWithSynonyms,
                categories: knowledgeBase.reduce((acc, item) => {
                    const cat = item.category || "uncategorized";
                    acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                }, {}),
                lastLoaded: new Date().toISOString(),
                sampleKeywords: knowledgeBase.slice(0, 5).map(item => item.keyword)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------
// HISTORY ENDPOINTS
// ---------------------------
router.get("/history", authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    try {
        const chats = await Chat.find({ userId: req.user._id })
            .sort({ updatedAt: -1 })
            .limit(10);
        res.json(chats);
    } catch (error) {
        console.error("History error:", error);
        res.status(500).json({ message: "Error fetching history" });
    }
});

// ---------------------------
// CLEAR CHAT HISTORY
// ---------------------------
router.delete("/clear", authenticate, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    try {
        await Chat.deleteMany({ userId: req.user._id });
        res.json({ success: true, message: "Chat history cleared successfully" });
    } catch (error) {
        console.error("Clear history error:", error);
        res.status(500).json({ success: false, message: "Error clearing history" });
    }
});

// ---------------------------
// HELPER FUNCTIONS
// ---------------------------
async function saveToHistory(userId, question, answer, source) {
    try {
        let chat = await Chat.findOne({ userId });
        if (!chat) {
            chat = new Chat({ userId, messages: [] });
        }

        chat.messages.push(
            { role: "user", text: question, timestamp: new Date() },
            { role: "assistant", text: answer, timestamp: new Date(), source }
        );

        await chat.save();
        console.log("💾 Chat saved to history");
    } catch (error) {
        console.error("Error saving chat:", error);
    }
}

// ---------------------------
// RELOAD KNOWLEDGE BASE (admin function)
// ---------------------------
router.post("/reload-kb", authenticate, (req, res) => {
    // Check if user is admin
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: "Admin access required" });
        }

        const oldCount = knowledgeBase.length;
        loadKnowledgeBase();
        const newCount = knowledgeBase.length;

        res.json({
            success: true,
            message: `Knowledge base reloaded. ${newCount} entries loaded.`,
            stats: {
                previous: oldCount,
                current: newCount,
                difference: newCount - oldCount,
                reloadedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;