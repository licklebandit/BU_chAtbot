// backend/quick-test.js (run from backend folder)
import fs from "fs";
import path from "path";

const knowledgePath = path.join('data', 'knowledge.json');

console.log(`🔍 Testing knowledge base at: ${knowledgePath}`);

if (!fs.existsSync(knowledgePath)) {
  console.error(`❌ File not found!`);
  console.log(`Current directory: ${process.cwd()}`);
  console.log(`Looking for: ${path.resolve(knowledgePath)}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
console.log(`✅ Found ${data.length} items in knowledge.json`);

// Test specific queries
const tests = [
  "admission requirements",
  "tuition fees", 
  "courses offered",
  "hello world"
];

console.log("\n🧪 Testing queries:");
tests.forEach(query => {
  console.log(`\nQuery: "${query}"`);
  
  const cleanQuery = query.toLowerCase();
  let found = false;
  
  for (const item of data) {
    const keyword = (item.keyword || '').toLowerCase();
    if (keyword.includes(cleanQuery) || cleanQuery.includes(keyword)) {
      console.log(`✅ FOUND: "${item.keyword}"`);
      console.log(`Answer: ${item.answer.substring(0, 80)}...`);
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.log(`❌ NOT FOUND in knowledge base`);
  }
});