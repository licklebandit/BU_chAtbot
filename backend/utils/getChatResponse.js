// utils/getChatResponse.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Get AI response using Google Gemini with context
 * @param {string} userQuestion
 * @param {string} context
 * @returns {Promise<{text: string}>}
 */
export async function getChatResponse(userQuestion, context = "") {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are Bugema University's AI assistant. Answer politely and accurately.
If you have relevant information in the context, use it to answer the question.
If you don't have relevant information, provide a general helpful response.

Context:
${context || "No specific context available."}

Question: ${userQuestion}
Answer:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return { text: response.text() || "I am not sure about that." };
  } catch (error) {
    console.error("Google GenAI error:", error);
    return { text: "Sorry, I couldn’t process your request right now." };
  }
}
