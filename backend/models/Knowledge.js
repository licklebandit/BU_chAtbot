// models/Knowledge.js
import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    tags: [String],
    type: { type: String, enum: ["knowledge", "faq"], default: "knowledge" },
    source: { type: String, default: "Admin Panel" },
  },
  { timestamps: true }
);

export default mongoose.model("Knowledge", knowledgeSchema);
