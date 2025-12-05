// backend/utils/embeddings.js - FIXED VERSION
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getEmbedding(text) {
    try {
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return null;
        }
        
        // Use the embedding model
        const model = genAI.getGenerativeModel({ 
            model: "embedding-001"  // Gemini embedding model
        });
        
        // Generate embedding
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        
        if (embedding && embedding.values) {
            return embedding.values; // Return the embedding values
        } else if (embedding) {
            return embedding;
        }
        
        console.warn("⚠️ No embedding returned for text");
        return null;
    } catch (error) {
        console.error("❌ Failed to generate embedding:", error.message);
        
        // Fallback: Create a simple hash-based embedding for testing
        if (process.env.NODE_ENV === 'development') {
            console.log("⚠️ Using fallback embedding for development");
            return createSimpleEmbedding(text);
        }
        
        return null;
    }
}

// Simple fallback embedding for development
function createSimpleEmbedding(text) {
    const embedding = new Array(384).fill(0); // 384-dimension embedding
    const words = text.toLowerCase().split(/\s+/);
    
    // Simple word hash distribution
    words.forEach(word => {
        const hash = word.split('').reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);
        const index = hash % 384;
        embedding[index] += 0.1;
    });
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
        return embedding.map(val => val / norm);
    }
    
    return embedding;
}