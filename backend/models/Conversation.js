import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // The ID of the user who started the chat
    user_name: { type: String }, // User's display name or email
    snippet: { type: String, required: true }, // First message/summary
    
    // Full chat transcript
    transcript: [{
        role: { type: String, enum: ['user', 'bot'] },
        text: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    
    isUnread: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Conversation', conversationSchema);
