// backend/utils/embeddings.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Initialize Gemini client with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates an embedding vector for a given text.
 * @param {string} text 
 * @returns {Promise<number[]>} The embedding vector.
 */
export async function getEmbedding(text) {
    try {
        // Try to use the embedContent method if available
        // Note: This requires the Generative Language API to be enabled 
        // and the model name to be supported for embeddings
        
        // For now, return null/empty to skip embedding-based search
        // The vector search will fall back to the simple KB keyword matching
        console.warn("⚠️ Embeddings not available; vector search skipped.");
        return null;
        
    } catch (error) {
        console.error("❌ Failed to generate embedding:", error.message);
        return null; // Return null instead of throwing so fallback takes over
    }
}

export function chunkText(text, chunkSize = 800, overlap = 200) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = start + chunkSize;
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }
    return chunks;
}