// backend/utils/embeddings.js - CRITICALLY UPDATED
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
        const model = 'text-embedding-004'; 

        // 🛑 CRITICAL FIX: Use the 'embedContent' method with the correct object structure.
        // This is necessary to resolve potential INVALID_ARGUMENT (400) errors.
        const result = await genAI.embedContent({ 
            model: model, 
            content: text 
        });

        // The embedding object structure is: { embedding: { values: [] } }
        return result.embedding.values;
    } catch (error) {
        console.error("❌ CRITICAL ERROR: Failed to generate embedding (Check API Key/Plan):", error.message);
        // This failure is what causes searchKnowledge to crash and the LLM response to fail.
        throw new Error("Failed to generate embedding with Gemini API.");
    }
}

/**
 * Utility function to split large text into smaller chunks.
 * NOTE: This should ideally be moved to its own file (e.g., chunker.js) for clean architecture.
 */
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