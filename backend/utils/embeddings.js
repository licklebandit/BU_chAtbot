// backend/utils/embeddings.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// ✅ Initialize Gemini client with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    const result = await model.embedContent(text);
    return result.embedding.values; // ✅ Return the embedding vector
  } catch (error) {
    console.error("❌ Error generating Gemini embedding:", error);
    throw new Error("Failed to generate embedding with Gemini API.");
  }
}
