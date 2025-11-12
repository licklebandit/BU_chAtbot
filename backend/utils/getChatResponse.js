// utils/getChatResponse.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates chat response using Google Gemini (Gemini Pro).
 * @param {string} question
 * @param {string} context
 * @returns {Promise<string>}
 */
export async function getChatResponse(question, context = "") {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are Bugema University's AI assistant. Be polite, helpful, and accurate. 
If you have relevant information in the context, use it to answer the question.
If you don't have relevant information, say so and provide a general response.

Context:
${context || "No specific context available."}

Question: ${question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Google GenAI error:", error);
    return "Sorry, I couldn’t process your request right now.";
  }
}
