// backend/utils/getChatResponse.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
}

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ""); 

/**
 * Get AI response using Google Gemini with context
 * @param {string} userQuestion - The question asked by the user.
 * @param {string} context - The relevant text retrieved from the knowledge base.
 * @returns {Promise<{text: string}>}
 */
export async function getChatResponse(userQuestion, context = "") {
    if (!process.env.GEMINI_API_KEY) {
        return { text: "Backend service error: API Key is missing." };
    }

    try {
        // 1. Define the System Instruction (Model Persona and Rules)
        const systemInstruction = `You are Bugema University's AI assistant. Answer the user's question politely, concisely, and accurately. 
You MUST use the provided Context to answer the Question. If the Context is empty or does not contain the answer, state clearly and politely that you cannot find the relevant information in the provided knowledge base.`;

        // 2. Build the new user prompt (Focus on synthesis)
        const userPrompt = `
Context:
---
${context.trim() || 'No specific context was found. The knowledge base does not contain any relevant information for this query.'}
---

Question: ${userQuestion.trim()}

Please use the Context above to generate a complete and helpful answer to the user's Question. Do not simply repeat the context; synthesize a direct and conversational response.
`;

        // 3. Try a list of candidate models until one succeeds.
        const candidateModels = [
            "gemini-2.5-flash", 
            "gemini-1.5-flash",
            "gemini-pro",
        ];

        let result = null;
        let lastErr = null;
        for (const m of candidateModels) {
            try {
                const model = ai.getGenerativeModel(m); 
                
                const response = await model.generateContent({ 
                    contents: [{ role: 'user', parts: [{ text: userPrompt }] }], 
                    config: {
                        systemInstruction: systemInstruction 
                    }
                });

                if (response && response.text) {
                    result = response;
                    console.log(`GenAI: model '${m}' succeeded.`);
                    break;
                }
            } catch (callErr) {
                lastErr = callErr;
                console.warn(`GenAI model '${m}' failed:`, callErr); 
            }
        }

        if (!result && lastErr) {
            throw lastErr;
        }

        let responseText = result.text.trim();
        if (!responseText) responseText = "I am not sure about that.";
        
        return { text: responseText }; // Returns object { text: string }
    } catch (error) {
        console.error("--- Google GenAI API Call FAILED ---");
        console.error("Error Message:", error.message);
        
        // Fallback: Use the retrieved context (if any) to provide a minimal answer
        if (context && typeof context === 'string' && context.trim()) {
            console.warn('GenAI failed — falling back to knowledge context as the answer.');
            // This message is why the user saw the fallback error. The LLM failed.
            return { text: `Sorry, I experienced a service error, but here is the relevant information I found: ${context.trim()}` };
        }

        return { text: "Sorry, I couldn’t process your request due to an AI service error." };
    }
}