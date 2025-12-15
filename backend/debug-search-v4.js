
import { loadKnowledgeBase, getKnowledgeBase } from './utils/knowledgeLoader.js';
import { detectIntent, getRecommendedCategories } from './utils/intentClassifier.js';
import { isVariationOf } from './utils/questionVariations.js';

async function runDebug() {
    await loadKnowledgeBase();
    const knowledgeBase = getKnowledgeBase();

    // TEST QUERY that was failing
    const query = "what is the application process at bugema university";
    console.log(`\n🔎 ANALYZING QUERY: "${query}"`);

    const cleanQuery = query.toLowerCase().trim();
    const intentResult = detectIntent(query);
    console.log(`   🧠 Intent: ${intentResult.intent} (${intentResult.type}, confidence: ${intentResult.confidence.toFixed(2)})`);

    const stopWords = ['what', 'where', 'when', 'who', 'how', 'why', 'which', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 'could', 'would', 'should', 'may', 'might', 'must', 'the', 'a', 'an', 'and', 'or', 'but', 'so', 'for', 'nor', 'yet', 'at', 'by', 'from', 'in', 'of', 'on', 'to', 'with', 'as', 'into', 'like', 'than', 'that', 'this', 'these', 'those', 'please', 'tell', 'me', 'about', 'give', 'information', 'regarding'];
    const importantWords = ['library', 'admission', 'fee', 'course', 'program', 'contact', 'hostel', 'scholarship', 'registration', 'exam', 'graduation', 'portal', 'medical', 'international', 'vc', 'warden', 'bensdoff', 'bugema', 'university', 'campus', 'student', 'location', 'hours', 'time', 'phone', 'email', 'address', 'vice', 'chancellor'];

    const queryWords = cleanQuery.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(word => {
        if (word.length < 2) return false;
        if (importantWords.includes(word)) return true;
        return !stopWords.includes(word);
    });

    console.log(`   📝 Query words: ${queryWords.join(', ')}`);

    let bestMatch = null;
    let bestScore = 0;

    const targetItems = knowledgeBase.filter(item =>
        item.keyword.includes("Bugema University") ||
        item.keyword.toLowerCase().includes("application") ||
        (item.tags && item.tags.some(t => t.includes("application")))
    );

    for (const item of targetItems) {
        if (!item.keyword || !item.answer) continue;

        const keyword = item.keyword.toLowerCase().trim();
        const synonyms = item.synonyms || [];
        const allSynonyms = [...synonyms, ...(item.tags || [])];
        let score = 0;
        const scoringDetails = {};

        if (keyword === cleanQuery) { score += 100; scoringDetails.exactMatch = true; }
        if (cleanQuery.includes(keyword)) { score += 80; scoringDetails.containsKeyword = true; }
        if (keyword.startsWith(cleanQuery)) { score += 15; scoringDetails.startsWithQuery = true; }

        for (const synonym of allSynonyms) {
            const synLower = synonym.toLowerCase();
            if (cleanQuery.includes(synLower)) {
                score += 60;
                scoringDetails.synonymMatch = synonym;

                // MIRRORING THE FIX: Check for 2+ words
                if (synLower.split(' ').length >= 2) {
                    score += 50;
                    scoringDetails.phraseTagMatch = true;
                }
                break;
            }
        }

        // ... (Simulating other parts briefly)
        if (intentResult.type === 'university') {
            const recommendedCats = getRecommendedCategories(intentResult);
            if (recommendedCats.length > 0 && item.category) {
                if (recommendedCats.includes(item.category.toLowerCase())) {
                    score += 25;
                    scoringDetails.intentBonus = true;
                }
            }
        }

        console.log(`   👉 Item: "${item.keyword}" -> Score: ${score}`);
        console.log(`      Details: ${JSON.stringify(scoringDetails)}`);

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }

    console.log(`\n🏆 WINNER: "${bestMatch ? bestMatch.keyword : 'None'}" with Score: ${bestScore}`);
}

runDebug();
