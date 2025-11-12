// utils/searchKnowledge.js
import fs from "fs";
import path from "path";
import { searchSimilar } from "../routes/vectorStore.js"; // semantic search
import fuzz from "fuzzball";

const KNOWLEDGE_PATH = path.resolve("data/knowledge.json");

// Load knowledge base
let knowledgeBase = [];
if (fs.existsSync(KNOWLEDGE_PATH)) {
  try {
    knowledgeBase = JSON.parse(fs.readFileSync(KNOWLEDGE_PATH, "utf8"));
  } catch (err) {
    console.error("⚠️ Failed to parse knowledge.json:", err);
  }
} else {
  console.warn("⚠️ knowledge.json not found.");
}

/**
 * Searches the knowledge base for context.
 * Combines semantic search (vector) + fuzzy string matching.
 */
export async function searchKnowledge(query) {
  if (!knowledgeBase || knowledgeBase.length === 0) return "";

  // 1️⃣ Fuzzy string matching
  const fuzzyResults = knowledgeBase.map(item => ({
    ...item,
    score: fuzz.ratio(query.toLowerCase(), item.keyword.toLowerCase())
  }));
  const bestFuzzy = fuzzyResults.reduce((prev, curr) =>
    curr.score > prev.score ? curr : { score: 0 }
  );

  let context = "";
  if (bestFuzzy.score > 60) {
    context += `${bestFuzzy.keyword}: ${bestFuzzy.answer}\n\n`;
  }

  // 2️⃣ Semantic vector search
  const semanticResults = await searchSimilar(query, 3);
  semanticResults.forEach(item => {
    context += `${item.chunk}\n\n`;
  });

  return context.trim();
}
