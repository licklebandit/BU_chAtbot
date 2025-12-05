// backend/scripts/test-kb.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: Go up one level from scripts to backend root, then to data
const knowledgePath = path.join(__dirname, '..', 'data', 'knowledge.json');

console.log(`🔍 Looking for knowledge.json at: ${knowledgePath}`);

if (!fs.existsSync(knowledgePath)) {
  console.error(`❌ ERROR: knowledge.json not found at ${knowledgePath}`);
  console.log("Please check the file exists and try again.");
  process.exit(1);
}

try {
  const rawData = fs.readFileSync(knowledgePath, 'utf8');
  const knowledgeData = JSON.parse(rawData);
  
  console.log(`✅ Loaded ${knowledgeData.length} items from knowledge.json`);
  console.log("\n📚 Available questions:");
  knowledgeData.forEach((item, i) => {
    console.log(`${i + 1}. "${item.keyword}"`);
  });

  console.log("\n🔍 Testing queries...");

  const testQueries = [
    "admission requirements",
    "tuition fees",
    "courses offered",
    "how do i get admissions",
    "who is the vc",
    "what courses do you offer",
    "how much are fees",
    "hello"
  ];

  function searchInKB(query) {
    const cleanQuery = query.toLowerCase().trim();
    
    // 1. Exact match
    for (const item of knowledgeData) {
      const keyword = (item.keyword || '').toLowerCase().trim();
      if (keyword === cleanQuery) {
        return { match: true, type: 'exact', answer: item.answer, keyword: item.keyword };
      }
    }
    
    // 2. Contains match
    for (const item of knowledgeData) {
      const keyword = (item.keyword || '').toLowerCase().trim();
      if (keyword.includes(cleanQuery) || cleanQuery.includes(keyword)) {
        return { match: true, type: 'contains', answer: item.answer, keyword: item.keyword };
      }
    }
    
    // 3. Word match
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2);
    if (queryWords.length > 0) {
      let bestMatch = null;
      let bestScore = 0;
      
      for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        const answer = (item.answer || '').toLowerCase();
        const combined = `${keyword} ${answer}`;
        
        let score = 0;
        for (const word of queryWords) {
          if (combined.includes(word)) {
            score++;
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item;
        }
      }
      
      if (bestMatch && bestScore > 0 && bestScore >= queryWords.length * 0.5) {
        return { match: true, type: 'word', answer: bestMatch.answer, keyword: bestMatch.keyword, score: bestScore };
      }
    }
    
    return { match: false, type: 'none' };
  }

  // Run tests
  console.log("\n🧪 TEST RESULTS:");
  testQueries.forEach(query => {
    const result = searchInKB(query);
    console.log(`\n"${query}"`);
    if (result.match) {
      console.log(`✅ MATCH (${result.type}): ${result.keyword}`);
      console.log(`📝 Answer: ${result.answer.substring(0, 100)}...`);
    } else {
      console.log(`❌ NO MATCH`);
    }
  });

  console.log("\n✅ Testing complete!");
  
} catch (error) {
  console.error("❌ Error loading or parsing knowledge.json:", error.message);
  process.exit(1);
}