// backend/utils/getChatResponse.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "CRITICAL: GEMINI_API_KEY is missing from environment variables.",
  );
}

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Get AI response using Google Gemini with context
 * @param {string} userQuestion - The question asked by the user.
 * @param {string} context - The relevant text retrieved from the knowledge base.
 * @param {string} imageUrl - Optional URL of an image to include in the query.
 * @param {Array} history - Optional array of previous messages {role: 'user'|'model', parts: [{text: '...'}]}
 * @returns {Promise<{text: string}>}
 */
export async function getChatResponse(userQuestion, context = "", imageUrl = null, history = []) {
  if (!process.env.GEMINI_API_KEY) {
    return { text: "Backend service error: API Key is missing." };
  }

  // Sanitizing history to ensure it matches Gemini API format
  const sanitizedHistory = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : h.role, // Ensure assistant -> model
    parts: h.parts || [{ text: h.text || "" }] // Ensure parts structure
  }));

  try {
    // 1. Define Smart System Instruction
    const systemInstruction = `You are BUchatbot, an intelligent and friendly AI assistant for Bugema University.
    
    YOUR GOAL: Provide helpful, accurate, and conversational answers to the user's questions.
    
    INSTRUCTIONS FOR USING CONTEXT:
    1. You will be provided with "Context" which may contain facts from the university database or web search results.
    2. USE THIS CONTEXT clearly to answer the question.
    3. Do NOT just copy-paste the context. Paraphrase it naturally.
    4. If the context contains the answer, verify it matches the user's intent and use it.
    5. If the context is empty or irrelevant, politely use your general knowledge to answer (or admit you don't know specific university details).
    6. If the user asks for a reasoning (e.g., "Why...", "How do I..."), explain step-by-step using the facts available.
    
    TONE AND STYLE:
    - Professional yet approachable.
    - Concise (do not ramble).
    - Use clear formatting (bullet points) for lists.
    - NO Markdown symbols like **bold** or # headers that might break simple UI displays (unless the UI supports it, but safe to keep it minimal).
    
    CRITICAL:
    - If data in context contradicts your general training, TRUST THE CONTEXT (it is the latest university data).
    `;

    // 2. Build the new user prompt
    let userPrompt = `
Context Information:
---------------------
${context.trim() || "No specific database information available."}
---------------------

User Question: "${userQuestion.trim()}"

Answer the question using the context above. If the context provides the answer, rephrase it naturally. if you are greeting, be polite and introduce yourself.`;

    // 3. Model Selection - prioritizing efficient "flash" models for cost/speed
    const envModel = process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim();
    const defaultCandidates = [
      "gemini-2.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro"
    ];
    const candidateModels = envModel
      ? [envModel, ...defaultCandidates.filter((m) => m !== envModel)]
      : defaultCandidates;

    console.log(
      `🎯 GEMINI Model Selection: ${candidateModels[0]} (optimized for free tier)`,
    );

    let result = null;
    let lastErr = null;
    let finalText = null;
    for (const m of candidateModels) {
      try {
        console.log(`  ➡️  Attempting model: ${m}`);
        const model = ai.getGenerativeModel({
          model: m,
          systemInstruction: { parts: [{ text: systemInstruction }] } // Try passing system instruction formally
        });

        console.log(`     Sending generateContent request with ${sanitizedHistory.length} history items...`);

        // Prepare parts for the user message
        const userParts = [{ text: userPrompt }];

        // If imageUrl is provided, fetch and add the image
        if (imageUrl) {
          try {
            const axios = (await import('axios')).default;
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data);
            const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
            const base64Image = imageBuffer.toString('base64');

            userParts.push({
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            });
            console.log(`     Image added to request (${mimeType})`);
          } catch (imageError) {
            console.warn(`⚠️ Failed to fetch image from ${imageUrl}:`, imageError.message);
          }
        }

        // Construct full conversation history + new message
        const contents = [
          ...sanitizedHistory,
          { role: "user", parts: userParts }
        ];

        const response = await model.generateContent({
          contents: contents,
        });

        // Extract text
        let responseText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText && response?.text) {
          responseText = typeof response.text === 'function' ? response.text() : response.text;
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
      }
    }

    if (!result && lastErr) {
      throw lastErr;
    }

    if (finalText) {
      return { text: finalText.trim() };
    }

    return { text: "I am not sure about that." };
  } catch (error) {
    console.error("❌ Google GenAI API Call FAILED:", error.message);

    // Fallback to KB context
    if (context && typeof context === "string" && context.trim()) {
      console.log("✅ GenAI failed but KB context is available; returning context instead.");
      return { text: context };
    }

    return {
      text: "I don't have that information in my knowledge base. Please contact support or try asking a different question.",
    };
  }
}