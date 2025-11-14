// utils/vectorStore.js
import fs from "fs";
import path from "path";
import { getEmbedding } from "./embeddings.js";

const VECTOR_PATH = path.resolve("vector_store.json");

// Load stored vectors
let store = [];
if (fs.existsSync(VECTOR_PATH)) {
  store = JSON.parse(fs.readFileSync(VECTOR_PATH, "utf8"));
}

// Add document chunks to the vector store
export async function addDocumentChunks(chunks, source) {
  const entries = [];
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    entries.push({ source, chunk, embedding });
  }
  store.push(...entries);
  fs.writeFileSync(VECTOR_PATH, JSON.stringify(store, null, 2));
}

// Semantic search using cosine similarity
export async function searchSimilar(query, topK = 3) {
  try {
    console.log("🔍 searchSimilar called");
    
    // Call getEmbedding with a timeout to prevent hanging
    let queryEmb;
    try {
      const embeddingPromise = getEmbedding(query);
      // Set 2-second timeout
      queryEmb = await Promise.race([
        embeddingPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Embedding timeout")), 2000))
      ]);
    } catch (embErr) {
      console.warn("⚠️ getEmbedding failed or timed out:", embErr.message);
      queryEmb = null;
    }
    
    // If embeddings are not available (returns null or timeout), skip vector search
    if (!queryEmb || !Array.isArray(queryEmb) || queryEmb.length === 0) {
      console.warn("⚠️ Vector search skipped: embeddings not available");
      return []; // Return empty; searchKnowledge will use KB fallback
    }

    function cosineSim(a, b) {
      if (!a || !b || !Array.isArray(a) || !Array.isArray(b)) return 0;
      const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
      const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
      const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
      return dot / (normA * normB);
    }

    const results = store
      .filter(item => item.embedding && Array.isArray(item.embedding))
      .map(item => ({ ...item, score: cosineSim(queryEmb, item.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  } catch (err) {
    console.error("❌ searchSimilar error:", err.message);
    return [];
  }
}
