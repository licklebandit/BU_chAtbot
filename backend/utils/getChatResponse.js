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
        // 1. Determine RAG mode and define the System Instruction (Model Persona and Rules)
        const RAG_MODE = (process.env.RAG_MODE || 'refine').toLowerCase();
        let systemInstruction = '';
        if (RAG_MODE === 'kb-only') {
            systemInstruction = `You are Bugema University's AI assistant. Answer the user's question politely, concisely, and accurately.\nYou MUST use the provided Context to answer the Question. If the Context is empty or does not contain the answer, state clearly and politely that you cannot find the relevant information in the provided knowledge base.`;
        } else if (RAG_MODE === 'refine') {
            systemInstruction = `You are Bugema University's AI assistant. Answer the user's question politely, concisely, and accurately. If a Context is provided, use it to produce a concise, accurate, and polished answer that references or summarizes the context when relevant. If no Context is provided, answer the question using your general knowledge. Do not fabricate facts; if you don't know, say so.`;
        } else {
            // llm-only or any other mode: allow open-domain answers while optionally using context
            systemInstruction = `You are Bugema University's AI assistant. Answer the user's question politely, concisely, and accurately. You may use the provided Context if present, but you are not required to do so — answer using your general knowledge when appropriate. Do not fabricate facts; if you don't know, say so.`;
        }

        // 2. Build the new user prompt (Focus on synthesis)
        const userPrompt = `
Context:
---
${context.trim() || 'No specific context was found.'}
---

Question: ${userQuestion.trim()}

Please generate a complete and helpful answer to the user's question. If Context is provided, incorporate it where useful; otherwise answer based on general knowledge.`;

        // 3. Respect GEMINI_MODEL env var if set, otherwise try a list of candidate models until one succeeds.
        const envModel = process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim();
        const defaultCandidates = [
            "gemini-2.5-flash",
            "gemini-1.5-flash",
            "gemini-pro",
        ];
        const candidateModels = envModel ? [envModel, ...defaultCandidates.filter(m => m !== envModel)] : defaultCandidates;
        
        console.log(`🎯 GEMINI_MODEL env: ${envModel || '(not set)'}, Trying models in order:`, candidateModels);

    let result = null;
    let lastErr = null;
    let finalText = null;
        for (const m of candidateModels) {
            try {
                console.log(`  ➡️  Attempting model: ${m}`);
                // 🛑 CRITICAL FIX: Must provide model name inside an object: { model: m }
                const model = ai.getGenerativeModel({ 
                    model: m
                }); 
                
                // Embed system instruction in the user prompt directly
                // (avoids issues with systemInstruction parameter in getGenerativeModel)
                const combinedPrompt = `${systemInstruction}\n\n${userPrompt}`;
                
                console.log(`     Sending generateContent request...`);
                const response = await model.generateContent({
                    contents: [
                        { role: 'user', parts: [{ text: combinedPrompt }] }
                    ]
                });

                // Response received; avoid dumping large JSON to logs in normal operation
                
                // Extract text from response (may be nested in response.candidates[0].content.parts[0].text)
                let responseText = response?.text;
                if (!responseText && response?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    responseText = response.candidates[0].content.parts[0].text;
                }
                // Also try response.response.candidates structure
                if (!responseText && response?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    responseText = response.response.candidates[0].content.parts[0].text;
                }

                if (responseText) {
                    result = response;
                    finalText = responseText;
                    console.log(`✅ GenAI: model '${m}' succeeded.`);
                    break;
                } else {
                    console.warn(`⚠️ GenAI model '${m}' returned but no text found in response`);
                }
            } catch (callErr) {
                lastErr = callErr;
                console.warn(`❌ GenAI model '${m}' failed with exception:`, callErr.message);
                console.warn(`   Stack:`, callErr.stack);
            }
        }

        if (!result && lastErr) {
            throw lastErr;
        }

        // If we captured finalText during the loop, use it. Otherwise, try to extract now.
        if (finalText) {
            return { text: finalText.trim() };
        }

        // Extract text from result (handle both response.text and nested candidates structure)
        let responseText = result?.text;
        if (!responseText && result?.candidates?.[0]?.content?.parts?.[0]?.text) {
            responseText = result.candidates[0].content.parts[0].text;
        }
        // also handle result.response.candidates path
        if (!responseText && result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
            responseText = result.response.candidates[0].content.parts[0].text;
        }

        responseText = responseText?.trim() || "I am not sure about that.";

        return { text: responseText }; // Returns object { text: string }
    } catch (error) {
    // --- Error Logging and Fallback ---
    console.error("❌ Google GenAI API Call FAILED:", error.message);
    if (error.stack) console.error(error.stack);
        
        // If we have context from the KB, return it as-is (graceful degradation)
        if (context && typeof context === 'string' && context.trim()) {
            console.log("✅ GenAI failed but KB context is available; returning context instead.");
            return { text: context };
        }
        
        return { 
            text: "I don't have that information in my knowledge base. Please contact support or try asking a different question." 
        };
    }
}