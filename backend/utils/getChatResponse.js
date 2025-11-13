import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Ensure the API key is present for logging purposes
if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
}

// Initialize the client with the API key using the Google Generative AI client (Gemini).
// The 'ai' object is an instance of GoogleGenerativeAI.
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ""); 

/**
 * Get AI response using Google Gemini with context
 * @param {string} userQuestion - The question asked by the user.
 * @param {string} context - The relevant text retrieved from the knowledge base.
 * @returns {Promise<{text: string}>}
 */
export async function getChatResponse(userQuestion, context = "") {
    // If the API key was missing on startup, prevent API call
    if (!process.env.GEMINI_API_KEY) {
        return { text: "Backend service error: API Key is missing." };
    }

    try {
        // 1. Define the System Instruction (Model Persona and Rules)
        const systemInstruction = `You are Bugema University's AI assistant. Answer the user's question politely, concisely, and accurately. 
You MUST use the provided Context to answer the Question. If the Context does not contain the answer, state clearly that you cannot find the relevant information in the provided knowledge base, but do not apologize for the lack of information.`;

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
                // FIX for "ai.getGenerativeModel is not a function": use string argument
                const model = ai.getGenerativeModel(m); 
                
                const response = await model.generateContent({ 
                    contents: [{ role: 'user', parts: [{ text: userPrompt }] }], 
                    config: {
                        // Pass the persona/rules using the dedicated field
                        systemInstruction: systemInstruction 
                    }
                });

                // The modern SDK response has a .text property
                if (response && response.text) {
                    result = response;
                    console.log(`GenAI: model '${m}' succeeded.`);
                    break;
                }
            } catch (callErr) {
                lastErr = callErr;
                console.warn(`GenAI model '${m}' failed:`, callErr && callErr.message ? callErr.message : callErr);
            }
        }

        if (!result && lastErr) {
            // Re-throw the last error if no model succeeded
            throw lastErr;
        }

        // Get the response text and ensure it's not empty
        let responseText = result.text.trim();

        if (!responseText) responseText = "I am not sure about that.";
        return { text: responseText };
    } catch (error) {
        // --- Error Logging and Fallback ---
        console.error("--- Google GenAI API Call FAILED ---");
        console.error("Error Message:", error.message);
        
        // Fallback to the original context if the AI call failed
        try {
            if (context && typeof context === 'string' && context.trim()) {
                console.warn('GenAI failed — falling back to knowledge context as the answer.');
                // Return a combined message to inform the user
                return { text: `Sorry, I experienced a service error, but here is the relevant information I found in our knowledge base: ${context.trim()}` };
            }
        } catch (ex) {
            console.warn('Error while preparing fallback context:', ex);
        }

        return { text: "Sorry, I couldn’t process your request due to an AI service error." };
    }
}