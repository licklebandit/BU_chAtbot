import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Core Authentication Fields
    name: { 
        type: String, 
        trim: true 
    },
    email: { 
        type: String, 
        unique: true, 
        required: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    
    // Authorization Field
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user", 
    },
    
    // Fields for Admin Panel Metrics
    lastLogin: { 
        type: Date, 
        default: Date.now // Updates on every login (used for Active User count)
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    
    // ⚠️ Removed: The 'chats' array and 'freeQuestionsUsed' 
    // Chat history is now stored in the separate 'Conversation' collection 
    // for better scalability and faster user lookups.
});

export default mongoose.model("User", userSchema);