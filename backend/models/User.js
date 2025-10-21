// /backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  chats: [
    {
      question: String,
      answer: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  freeQuestionsUsed: { type: Number, default: 0 }, // track free use
});

export default mongoose.model("User", userSchema);
