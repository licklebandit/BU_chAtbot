// backend/utils/embeddings.js - UPDATED
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// ✅ Initialize Gemini client with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getEmbedding(text) {
    try {
        // Use the recommended method for generating embeddings
        // The model 'text-embedding-004' is generally the correct choice,
        // but ensure the object syntax is correct for the embedContent method.
        const model = 'text-embedding-004'; 

        const result = await genAI.embedContent({ 
            model: model, 
            content: text 
        });

        return result.embedding.values; // ✅ Return the embedding vector
    } catch (error) {
        console.error("❌ CRITICAL ERROR: Failed to generate embedding:", error.message);
        // This is where your vector store search (searchSimilar) fails and crashes the system.
        throw new Error("Failed to generate embedding with Gemini API.");
    }
}