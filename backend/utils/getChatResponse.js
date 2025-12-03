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
 * @returns {Promise<{text: string}>}
 */
export async function getChatResponse(userQuestion, context = "") {
  if (!process.env.GEMINI_API_KEY) {
    return { text: "Backend service error: API Key is missing." };
  }

  try {
    // 1. Determine RAG mode and define the System Instruction (Model Persona and Rules)
    const RAG_MODE = (process.env.RAG_MODE || "refine").toLowerCase();
    let systemInstruction = "";
    if (RAG_MODE === "kb-only") {
      systemInstruction = `You are BUchatbot, Bugema University's friendly AI assistant. Answer the user's question politely, concisely, and accurately.

IMPORTANT GUIDELINES:
- You MUST use the provided Context to answer university-related questions
- If the Context is empty or doesn't contain the answer to a university question, politely state that you don't have that information in your knowledge base
- For questions not related to Bugema University (general questions, personal advice, etc.), respond politely and helpfully but gently redirect to university-related topics
- Always maintain a friendly, professional tone
- If you cannot help with a non-university question, suggest they contact the appropriate support services

Example responses for off-topic questions:
- "That's an interesting question! While I'm specifically designed to help with Bugema University matters, I'd be happy to assist you with any questions about our programs, admissions, campus life, or student services. What would you like to know about Bugema University?"
- "I appreciate your question, but I'm focused on helping with Bugema University-related inquiries. Is there anything about our academic programs, campus facilities, or student support services I can help you with instead?"`;
    } else if (RAG_MODE === "refine") {
      systemInstruction = `You are BUchatbot, Bugema University's friendly AI assistant. Answer the user's question politely, concisely, and accurately.

IMPORTANT GUIDELINES:
- If Context is provided about Bugema University topics, use it to produce a concise, accurate, and polished answer
- For university-related questions without specific context, provide helpful general guidance when possible
- For questions not related to Bugema University, respond politely but gently redirect to university topics
- Always maintain a friendly, professional tone representing Bugema University
- Do not fabricate university-specific facts; if you don't know something specific about Bugema, say so

Example responses for off-topic questions:
- "That's a great question! While I specialize in Bugema University information, I'd love to help you with questions about our academic programs, student life, admissions process, or campus services. What can I tell you about Bugema University?"
- "I appreciate your interest, but my expertise is in Bugema University matters. I'm here to help with anything related to our courses, facilities, student support, or university policies. How can I assist you with Bugema University?"`;
    } else {
      // llm-only or any other mode: allow open-domain answers while optionally using context
      systemInstruction = `You are BUchatbot, Bugema University's friendly AI assistant. Answer the user's question politely, concisely, and accurately.

IMPORTANT GUIDELINES:
- Prioritize Bugema University-related questions and provide comprehensive, helpful answers
- For general questions not related to the university, provide brief, helpful responses but gently encourage university-related inquiries
- Use provided Context when available and relevant
- Always maintain a friendly, professional tone representing Bugema University
- Do not fabricate facts; if you don't know something, say so honestly

For off-topic questions, provide a brief helpful response followed by a gentle redirect:
- "That's an interesting question! [Brief helpful response if appropriate]. As Bugema University's assistant, I'm particularly knowledgeable about our academic programs, campus life, and student services. Is there anything about Bugema University I can help you with?"`;
    }

    // 2. Build the new user prompt (Focus on synthesis)
    const userPrompt = `
Context:
---
${context.trim() || "No specific context was found."}
---

Question: ${userQuestion.trim()}

Please generate a complete and helpful answer to the user's question. If Context is provided, incorporate it where useful; otherwise answer based on general knowledge.`;

    // 3. Respect GEMINI_MODEL env var if set, otherwise try a list of candidate models until one succeeds.
    const envModel =
      process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim();
    const defaultCandidates = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-pro",
    ];
    const candidateModels = envModel
      ? [envModel, ...defaultCandidates.filter((m) => m !== envModel)]
      : defaultCandidates;

    console.log(
      `🎯 GEMINI_MODEL env: ${envModel || "(not set)"}, Trying models in order:`,
      candidateModels,
    );

    let result = null;
    let lastErr = null;
    let finalText = null;
    for (const m of candidateModels) {
      try {
        console.log(`  ➡️  Attempting model: ${m}`);
        // 🛑 CRITICAL FIX: Must provide model name inside an object: { model: m }
        const model = ai.getGenerativeModel({
          model: m,
        });

        // Embed system instruction in the user prompt directly
        // (avoids issues with systemInstruction parameter in getGenerativeModel)
        const combinedPrompt = `${systemInstruction}\n\n${userPrompt}`;

        console.log(`     Sending generateContent request...`);
        const response = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: combinedPrompt }] }],
        });

        // Response received; avoid dumping large JSON to logs in normal operation

        // Extract text from response (may be nested in response.candidates[0].content.parts[0].text)
        let responseText = response?.text;
        if (
          !responseText &&
          response?.candidates?.[0]?.content?.parts?.[0]?.text
        ) {
          responseText = response.candidates[0].content.parts[0].text;
        }
        // Also try response.response.candidates structure
        if (
          !responseText &&
          response?.response?.candidates?.[0]?.content?.parts?.[0]?.text
        ) {
          responseText = response.response.candidates[0].content.parts[0].text;
        }

        if (responseText) {
          result = response;
          finalText = responseText;
          console.log(`✅ GenAI: model '${m}' succeeded.`);
          break;
        } else {
          console.warn(
            `⚠️ GenAI model '${m}' returned but no text found in response`,
          );
        }
      } catch (callErr) {
        lastErr = callErr;
        console.warn(
          `❌ GenAI model '${m}' failed with exception:`,
          callErr.message,
        );
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
    if (
      !responseText &&
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text
    ) {
      responseText = result.response.candidates[0].content.parts[0].text;
    }

    responseText = responseText?.trim() || "I am not sure about that.";

    return { text: responseText }; // Returns object { text: string }
  } catch (error) {
    // --- Error Logging and Fallback ---
    console.error("❌ Google GenAI API Call FAILED:", error.message);
    if (error.stack) console.error(error.stack);

    // If we have context from the KB, return it as-is (graceful degradation)
    if (context && typeof context === "string" && context.trim()) {
      console.log(
        "✅ GenAI failed but KB context is available; returning context instead.",
      );
      return { text: context };
    }

    return {
      text: "I don't have that information in my knowledge base. Please contact support or try asking a different question.",
    };
  }
}
