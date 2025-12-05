// backend/controllers/chatController.js - UPDATED VERSION
import { getChatResponse } from '../utils/getChatResponse.js';
import Chat from '../models/Chat.js';
import Knowledge from '../models/Knowledge.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load knowledge base from JSON file
const knowledgePath = path.join(__dirname, '../../data/knowledge.json');
let knowledgeData = [];

if (fs.existsSync(knowledgePath)) {
    try {
        knowledgeData = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
        console.log(`✅ Loaded ${knowledgeData.length} KB items for chat controller`);
    } catch (error) {
        console.error('❌ Failed to load knowledge.json in chat controller:', error.message);
    }
}

export async function handleChatQuery(req, res) {
    const { q, imageUrl } = req.body;

    if ((!q || q.trim() === "") && !imageUrl) {
        return res.status(400).json({ answer: "Please ask a valid question or provide an image." });
    }

    try {
        console.log(`\n💬 Chat query: "${q}"`);
        
        // Step 1: Search in knowledge base FIRST (before AI)
        const kbAnswer = searchInKnowledgeBase(q);
        
        if (kbAnswer) {
            console.log(`✅ Found in knowledge base: "${q}"`);
            
            // Save to chat history if user is logged in
            if (req.user) {
                await saveChatHistory(req.user._id, q, kbAnswer, imageUrl);
            }
            
            return res.json({ 
                answer: kbAnswer,
                source: "knowledge_base",
                foundMatch: true
            });
        }
        
        // Step 2: If no KB match, use AI with context
        console.log(`❌ No KB match for: "${q}" - using AI`);
        
        // Build context from knowledge base for AI
        let context = "You are Bugema University's AI assistant. ";
        context += "Be polite, helpful, and accurate.\n\n";
        
        // Add some relevant knowledge if available
        const relatedItems = findRelatedKnowledge(q);
        if (relatedItems.length > 0) {
            context += "Related Bugema University information:\n";
            relatedItems.forEach(item => {
                context += `- ${item.keyword}: ${item.answer}\n`;
            });
            context += "\n";
        }
        
        context += "Answer the user's question based on this information.\n";
        context += "If you don't know something about Bugema University, say so honestly.\n";
        
        const { text: aiAnswer } = await getChatResponse(q, context, imageUrl);
        let answer = aiAnswer || "I don't have information about that.";
        
        // Clean the response
        answer = answer.replace(/\*/g, '');
        
        // Save chat history if user is logged in
        if (req.user) {
            await saveChatHistory(req.user._id, q, answer, imageUrl);
        }
        
        res.json({ 
            answer,
            source: relatedItems.length > 0 ? "knowledge_enhanced_ai" : "ai_only",
            foundMatch: false
        });

    } catch (error) {
        console.error("Chat controller error:", error);
        res.status(500).json({
            answer: "Sorry, I couldn't process your request right now. Please try again."
        });
    }
}

// Helper: Search in knowledge base (same logic as simple endpoint)
function searchInKnowledgeBase(query) {
    if (!query || knowledgeData.length === 0) return null;
    
    const cleanQuery = query.toLowerCase().trim();
    
    // 1. Exact match
    for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        if (keyword === cleanQuery) {
            return item.answer;
        }
    }
    
    // 2. Partial match
    for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        if (keyword.includes(cleanQuery) || cleanQuery.includes(keyword)) {
            return item.answer;
        }
    }
    
    // 3. Word match
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
    let bestMatch = null;
    let bestScore = 0;
    
    for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        let score = 0;
        
        for (const word of words) {
            if (keyword.includes(word)) {
                score++;
            }
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }
    
    if (bestMatch && bestScore > 0) {
        return bestMatch.answer;
    }
    
    return null;
}

// Helper: Find related knowledge for context
function findRelatedKnowledge(query) {
    if (!query || knowledgeData.length === 0) return [];
    
    const cleanQuery = query.toLowerCase().trim();
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
    const related = [];
    
    for (const item of knowledgeData) {
        const keyword = (item.keyword || '').toLowerCase();
        let score = 0;
        
        for (const word of words) {
            if (keyword.includes(word)) {
                score++;
            }
        }
        
        if (score > 0) {
            related.push({ ...item, score });
        }
    }
    
    // Sort by score and return top 2
    return related.sort((a, b) => b.score - a.score).slice(0, 2);
}

// Helper function to save chat history
async function saveChatHistory(userId, question, answer, imageUrl) {
    try {
        let chat = await Chat.findOne({ userId });
        if (!chat) {
            chat = new Chat({ userId, messages: [] });
        }
        
        const userMessage = { role: "user", text: question };
        if (imageUrl) {
            userMessage.image = imageUrl;
        }
        
        chat.messages.push(
            userMessage,
            { role: "assistant", text: answer }
        );
        
        await chat.save();
    } catch (error) {
        console.error("Error saving chat history:", error);
    }
}