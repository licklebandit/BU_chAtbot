import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
  try {
    if (typeof ai.listModels !== 'function') {
      console.error('listModels is not available on this client.');
      return;
    }
    const models = await ai.listModels();
    console.log('Available models:', JSON.stringify(models, null, 2));
  } catch (err) {
    console.error('Failed to list models:', err);
  }
}

listModels();
