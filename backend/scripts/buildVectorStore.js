// backend/scripts/buildVectorStore.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { addDocumentChunks } from "../utils/vectorStore.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your knowledge base JSON
const KNOWLEDGE_PATH = path.resolve(__dirname, "../data/knowledge.json");

async function buildVectorStore() {
  if (!fs.existsSync(KNOWLEDGE_PATH)) {
    console.error("❌ knowledge.json not found at", KNOWLEDGE_PATH);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(KNOWLEDGE_PATH, "utf8"));
  console.log(`✅ Loaded ${raw.length} knowledge items`);

  // Create text chunks for embeddings
  const CHUNK_SIZE = 300;
  const allChunks = [];

  for (const item of raw) {
    const text = `${item.keyword}: ${item.answer}`;
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      const chunk = text.slice(i, i + CHUNK_SIZE);
      allChunks.push(chunk);
    }
  }

  console.log(`📚 Created ${allChunks.length} text chunks for embedding...`);

  await addDocumentChunks(allChunks, "knowledge_base");
  console.log("✅ Vector store built and saved successfully!");
}

buildVectorStore().catch((err) => {
  console.error("❌ Error building vector store:", err);
});
