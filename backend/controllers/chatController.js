import { GoogleGenAI } from '@google/genai';
import { cosinesim } from '../utils/vectorStore.js';
import Chat from '../models/Chat.js';
import fs from 'fs';

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Load knowledge base
const knowledgePath = "./data/knowledge.json";
let knowledgeBase = [];
if (fs.existsSync(knowledgePath)) {
    const fileData = fs.readFileSync(knowledgePath, "utf8");
    try {
        knowledgeBase = JSON.parse(fileData);
    } catch (error) {
        console.error("⚠️ Error parsing knowledge.json:", error);
    }
}

export async function handleChatQuery(req, res) {
    const { q } = req.body;
    
    if (!q || q.trim() === "") {
        return res.status(400).json({ answer: "Please ask a valid question." });
    }

    try {
        // Search knowledge base first using cosine similarity
        const relevantKnowledge = knowledgeBase
            .map(item => ({
                ...item,
                similarity: cosinesim(q.toLowerCase(), item.keyword.toLowerCase())
            }))
            .filter(item => item.similarity > 0.3) // Only keep items with decent similarity
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3); // Take top 3 most relevant items

        // Build context from relevant knowledge
        let context = "You are Bugema University's AI assistant. Be polite, helpful, and accurate.\n\n";
        
        if (relevantKnowledge.length > 0) {
            context += "Based on our knowledge base:\n";
            relevantKnowledge.forEach(item => {
                context += `${item.keyword}: ${item.answer}\n`;
            });
        } else {
            context += "No specific information found in our knowledge base. Please provide a general response.\n";
        }

        // Get response from Gemini
        const prompt = {
            contents: [{
                role: 'user',
                parts: [{ text: `${context}\n\nQuestion: ${q}` }]
            }]
        };

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text().trim();

        // Save chat history if user is logged in
        if (req.user) {
            let chat = await Chat.findOne({ userId: req.user._id });
            if (!chat) {
                chat = new Chat({ userId: req.user._id, messages: [] });
            }

            chat.messages.push(
                { role: "user", text: q },
                { role: "assistant", text: answer }
            );
            await chat.save();

            // Emit socket event for admin panel
            try {
                const io = req.app.get('io');
                if (io) {
                    io.emit('new_conversation', {
                        id: chat._id,
                        user_name: req.user.name || req.user.email || 'Unknown',
                        snippet: q,
                        createdAt: new Date()
                    });
                }
            } catch (err) {
                console.warn('Socket emit error:', err.message || err);
            }
        }

        res.json({ answer });

    } catch (error) {
        console.error("Chat controller error:", error);
        res.status(500).json({
            answer: "Sorry, I couldn't process your request right now."
        });
    }
}