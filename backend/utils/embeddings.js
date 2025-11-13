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
        const model = 'text-embedding-004'; 

        // 🛑 CRITICAL FIX: The error "genAI.embedContent is not a function" means
        // we must use the correct modern method: genAI.embed.content
        const result = await genAI.models.embedContent({ 
            model: model, 
            content: text 
        });

        return result.embedding.values;
    } catch (error) {
        console.error("❌ CRITICAL ERROR: Failed to generate embedding:", error.message);
        throw new Error("Failed to generate embedding with Gemini API.");
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