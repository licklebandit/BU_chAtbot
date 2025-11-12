// utils/searchKnowledge.js
import { searchSimilar } from "./vectorStore.js";

/**
 * Search the knowledge base using semantic search.
 * @param {string} query
 * @param {Array} knowledge - Optional: fallback knowledge items [{question, answer}]
 * @returns {string} context string
 */
export async function searchKnowledge(query, knowledge = []) {
  // First try semantic vector search
  const topResults = await searchSimilar(query, 3);
  if (topResults.length > 0) {
    // Combine top results as context
    return topResults.map(r => r.chunk).join("\n\n");
  }

  // Fallback: naive exact or partial match in knowledge.json
  if (knowledge.length > 0) {
    const match = knowledge.find(item => query.toLowerCase().includes(item.question.toLowerCase()));
    return match ? match.answer : "";
  }

  return ""; // No context available
}
