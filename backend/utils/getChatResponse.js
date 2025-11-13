import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Ensure the API key is present for logging purposes
if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
}

// Initialize the client with the API key using the Google Generative AI client (Gemini).
// This matches how embeddings.js initializes the client and exposes getGenerativeModel().
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ""); 

/**
 * Get AI response using Google Gemini with context
 * @param {string} userQuestion
 * @param {string} context
 * @returns {Promise<{text: string}>}
 */
export async function getChatResponse(userQuestion, context = "") {
  // If the API key was missing on startup, prevent API call
  if (!process.env.GEMINI_API_KEY) {
      return { text: "Backend service error: API Key is missing." };
  }

  try {
    const prompt = `You are Bugema University's AI assistant. Answer politely and accurately.`;

    // Build the contents payload (defensive shape expected by the SDK)
    const contents = [{ role: 'user', parts: [{ text: `${prompt}\n\nContext:\n${context || 'No specific context available.'}\n\nQuestion: ${userQuestion}` }] }];

    // Try a list of candidate models until one succeeds. Some accounts or API versions
    // may not support newer Gemini model names; fallbacks improve resilience.
    const candidateModels = [
      "gemini-1.5-flash",
      "gemini-1.5",
      "gemini-pro",
      "chat-bison-001",
      "text-bison-001",
    ];

    let result = null;
    let lastErr = null;
    for (const m of candidateModels) {
      try {
        const model = ai.getGenerativeModel({ model: m });
        result = await model.generateContent({ contents });
        // If we got a result, stop trying further models
        if (result) {
          console.log(`GenAI: model '${m}' succeeded.`);
          break;
        }
      } catch (callErr) {
        lastErr = callErr;
        // Log and continue to next candidate if model not found or unsupported
        console.warn(`GenAI model '${m}' failed:`, callErr && callErr.message ? callErr.message : callErr);
        // continue trying next model
      }
    }

    if (!result && lastErr) {
      // Try to list available models (best-effort) to aid debugging
      try {
        if (typeof ai.listModels === 'function') {
          const available = await ai.listModels();
          console.warn('GenAI available models:', available);
        }
      } catch (listErr) {
        console.warn('Failed to list GenAI models:', listErr && listErr.message ? listErr.message : listErr);
      }

      // bubble up last error to outer catch for consistent handling/logging
      throw lastErr;
    }

    // Defensive parsing of possible SDK response shapes
    let responseText = "";
    try {
      // direct text
      if (result == null) responseText = "";
      else if (typeof result.text === 'string' && result.text.trim()) responseText = result.text.trim();
      else if (result.response && typeof result.response.text === 'string') responseText = result.response.text.trim();
      else if (result.response && typeof result.response.output_text === 'string') responseText = result.response.output_text.trim();
      else if (Array.isArray(result.output) && result.output.length && result.output[0].content && result.output[0].content[0]) {
        responseText = String(result.output[0].content[0].text || result.output[0].content[0].text).trim();
      } else if (result?.candidates && Array.isArray(result.candidates) && result.candidates[0]) {
        responseText = String(result.candidates[0].content?.join?.(' ') || result.candidates[0].text || '').trim();
      }
    } catch (ex) {
      console.warn('Failed to normalize GenAI response shape:', ex, 'rawResult:', result);
    }

    if (!responseText) responseText = "I am not sure about that.";
    return { text: responseText };
  } catch (error) {
    // This logs the full API error to your server console for debugging
    console.error("--- Google GenAI API Call FAILED ---");
    console.error("Error Message:", error.message);
    console.error("Error Name:", error.name);
    
    // If the error message indicates an API key issue, prompt the user to check it
    if (error.message.includes("400") || error.message.includes("403")) {
        console.error("HINT: A 400 or 403 error often means the GEMINI_API_KEY is invalid or unauthorized. Please verify the key.");
    }

    // If we have useful context (from your knowledge base), prefer returning that
    // instead of an opaque AI-service error so the user still gets helpful info.
    try {
      if (context && typeof context === 'string' && context.trim()) {
        console.warn('GenAI failed — falling back to knowledge context as the answer.');
        return { text: context };
      }
    } catch (ex) {
      console.warn('Error while preparing fallback context:', ex);
    }

    return { text: "Sorry, I couldn’t process your request due to an AI service error." };
  }
}