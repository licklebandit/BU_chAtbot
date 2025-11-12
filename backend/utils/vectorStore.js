// routes/vectorStore.js
import fs from "fs";
import path from "path";
import { getEmbedding } from "./embeddings.js";

const VECTOR_PATH = path.resolve("vector_store.json");

// Load stored vectors
let store = [];
if (fs.existsSync(VECTOR_PATH)) {
  store = JSON.parse(fs.readFileSync(VECTOR_PATH, "utf8"));
}

/**
 * Adds document chunks to the vector store
 * @param {string[]} chunks
 * @param {string} source
 */
export async function addDocumentChunks(chunks, source) {
  const entries = [];
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    entries.push({ source, chunk, embedding });
  }
  store.push(...entries);
  fs.writeFileSync(VECTOR_PATH, JSON.stringify(store, null, 2));
}

/**
 * Searches the vector store for the most similar chunks
 * @param {string} query
 * @param {number} topK
 * @returns {Promise<Array>}
 */
export async function searchSimilar(query, topK = 3) {
  if (!store || store.length === 0) return [];

  const queryEmb = await getEmbedding(query);

  function cosineSim(a, b) {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    return dot / (normA * normB);
  }

  return store
    .map(item => ({
      ...item,
      score: cosineSim(queryEmb, item.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
