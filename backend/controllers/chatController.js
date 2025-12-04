// backend/controllers/chatController.js
import { searchKnowledge } from '../utils/searchKnowledge.js';
import { getChatResponse } from '../utils/getChatResponse.js';
import Chat from '../models/Chat.js';
import Knowledge from '../models/Knowledge.js';

export async function handleChatQuery(req, res) {
    const { q, imageUrl } = req.body;

    if ((!q || q.trim() === "") && !imageUrl) {
        return res.status(400).json({ answer: "Please ask a valid question or provide an image." });
    }

    try {
        // Step 1: First search knowledge base directly
        const knowledgeResult = await searchKnowledgeDirect(q);
        
        // If we have a direct match from knowledge base, return it immediately
        if (knowledgeResult && knowledgeResult.trim() !== "") {
            console.log(`✅ Direct knowledge base match found for: "${q}"`);
            
            // Save to chat history if user is logged in
            if (req.user) {
                await saveChatHistory(req.user._id, q, knowledgeResult, imageUrl);
                emitSocketEvent(req, q, knowledgeResult);
            }
            
            return res.json({ 
                answer: knowledgeResult,
                source: "knowledge_base",
                foundMatch: true
            });
        }
        
        // Step 2: If no direct match, use the existing vector search approach
        const vectorKnowledge = await searchKnowledge(q);
        
        // Build context for AI
        let context = "You are Bugema University's AI assistant. Be polite, helpful, and accurate.\n\n";
        
        if (vectorKnowledge && vectorKnowledge.trim() !== "") {
            console.log(`🔍 Vector search found context for: "${q}"`);
            context += "Based on our knowledge base:\n";
            context += vectorKnowledge + "\n\n";
            context += "Please use this information to answer the user's question. If the information doesn't fully answer the question, provide additional helpful information.\n";
        } else {
            context += "No specific information found in our knowledge base. Please provide a general helpful response.\n";
        }
        
        // Step 3: Get response from Gemini with context
        const { text: answerFromLLM } = await getChatResponse(q, context, imageUrl);
        let answer = answerFromLLM || (context || "I couldn't find an answer right now.");
        
        // Clean the response
        answer = answer.replace(/\*/g, '');
        
        // Save chat history if user is logged in
        if (req.user) {
            await saveChatHistory(req.user._id, q, answer, imageUrl);
            emitSocketEvent(req, q, answer);
        }
        
        res.json({ 
            answer,
            source: vectorKnowledge ? "knowledge_enhanced_ai" : "ai_only",
            foundMatch: !!vectorKnowledge
        });

    } catch (error) {
        console.error("Chat controller error:", error);
        res.status(500).json({
            answer: "Sorry, I couldn't process your request right now. Please try again."
        });
    }
}

// Helper function to search knowledge base directly (not using vector store)
async function searchKnowledgeDirect(query) {
    try {
        const cleanQuery = query.trim().toLowerCase();
        
        // 1. Exact match search
        const exactMatch = await Knowledge.findOne({
            $or: [
                { question: { $regex: new RegExp(`^${cleanQuery}$`, 'i') } },
                { keyword: { $regex: new RegExp(`^${cleanQuery}$`, 'i') } }
            ],
            isActive: true
        });
        
        if (exactMatch) {
            // Increment views
            await Knowledge.findByIdAndUpdate(exactMatch._id, { $inc: { views: 1 } });
            return exactMatch.answer;
        }
        
        // 2. Search by individual words
        const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
        if (words.length > 0) {
            const wordMatch = await Knowledge.findOne({
                $or: [
                    { question: { $regex: new RegExp(words.join('|'), 'i') } },
                    { answer: { $regex: new RegExp(words.join('|'), 'i') } },
                    { tags: { $in: words } }
                ],
                isActive: true
            }).sort({ priority: -1, views: -1 }); // Sort by priority then views
            
            if (wordMatch) {
                await Knowledge.findByIdAndUpdate(wordMatch._id, { $inc: { views: 1 } });
                return wordMatch.answer;
            }
        }
        
        // 3. Text search using MongoDB text index
        try {
            const textMatch = await Knowledge.findOne(
                { $text: { $search: query }, isActive: true },
                { score: { $meta: "textScore" } }
            ).sort({ score: { $meta: "textScore" } });
            
            if (textMatch) {
                await Knowledge.findByIdAndUpdate(textMatch._id, { $inc: { views: 1 } });
                return textMatch.answer;
            }
        } catch (textError) {
            console.log("Text search not available:", textError.message);
        }
        
        return "";
        
    } catch (error) {
        console.error("Direct knowledge search error:", error);
        return "";
    }
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

// Helper function to emit socket event
function emitSocketEvent(req, question, answer) {
    try {
        const io = req.app.get('io');
        if (io && req.user) {
            io.emit('new_conversation', {
                id: new mongoose.Types.ObjectId(),
                user_name: req.user.name || req.user.email || 'Unknown',
                snippet: question.substring(0, 100),
                answer_snippet: answer.substring(0, 100),
                createdAt: new Date()
            });
        }
    } catch (err) {
        console.warn('Socket emit error:', err.message);
    }
}