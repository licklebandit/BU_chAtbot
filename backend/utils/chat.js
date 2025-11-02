import { GoogleGenAI } from '@google/genai';
import { cosinesim } from './vectorStore.js';

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

export async function searchKnowledge(question, knowledgeBase) {
  // Sort knowledge by relevance using cosine similarity
  const relevantKnowledge = knowledgeBase
    .map(item => ({
      ...item,
      similarity: cosinesim(question.toLowerCase(), item.keyword.toLowerCase())
    }))
    .filter(item => item.similarity > 0.3) // Only keep items with decent similarity
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3); // Take top 3 most relevant items

  if (relevantKnowledge.length === 0) return null;

  // Combine relevant knowledge into context
  const context = relevantKnowledge
    .map(item => `${item.keyword}: ${item.answer}`)
    .join('\n\n');

  return context;
}

export async function getChatResponse(question, context) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const basePrompt = `You are Bugema University's AI assistant. Be polite, helpful, and accurate. 
If you have relevant information in the context, use it to answer the question.
If you don't have relevant information, say so and provide a general response.

Context:
${context || 'No specific context available for this question.'}

Question: ${question}`;

  const result = await model.generateContent(basePrompt);
  const response = await result.response;
  return response.text();
}