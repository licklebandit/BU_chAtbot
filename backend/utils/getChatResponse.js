// utils/getChatResponse.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

// FIX: Initialize the SDK without arguments. 
// It will automatically use the GEMINI_API_KEY from the environment.
const ai = new GoogleGenAI({}); 

/**
 * Get AI response using Google Gemini with context
 * @param {string} userQuestion
 * @param {string} context
 * @returns {Promise<{text: string}>}
 */
export async function getChatResponse(userQuestion, context = "") {
  try {
    // You should use the recommended "gemini-2.5-flash" or "gemini-1.5-flash" 
    // for chat and RAG tasks as it's faster and cheaper.
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); 

    const prompt = `
You are Bugema University's AI assistant. Answer politely and accurately.
If you have relevant information in the context, use it to answer the question.
If you don't have relevant information, provide a general helpful response.

Context:
${context || "No specific context available."}

Question: ${userQuestion}
Answer:
`;

    const result = await model.generateContent({
        contents: prompt,
    });
    
    // Check if response text exists before returning
    const responseText = result.text || "I am not sure about that.";

    return { text: responseText };
  } catch (error) {
    console.error("Google GenAI error:", error);
    // The previous error message was generic; this one is specific to the backend
    return { text: "Sorry, I couldn’t process your request due to an AI service error." };
  }
}