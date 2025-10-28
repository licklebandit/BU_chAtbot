// ✅ UPDATED: Use the correct Google GenAI SDK package
import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";
dotenv.config();

// ✅ UPDATED: Initialize the GenAI client (replaces OpenAI client)
const ai = new GoogleGenAI({});

export async function getEmbedding(text) {
  try {
    // ✅ UPDATED: Switched from client.embeddings.create to ai.models.embedContent
    const response = await ai.models.embedContent({
      model: "text-embedding-004", // Switched from text-embedding-3-small to Gemini's powerful embedding model
      content: text // Input is now just 'content'
    });
    // ✅ UPDATED: Correctly extract the embedding values
    return response.embedding.values;
  } catch (error) {
    console.error("❌ Error generating Gemini embedding:", error);
    // Throw the error so the calling function can handle it
    throw new Error("Failed to generate embedding with Gemini API.");
  }
}
