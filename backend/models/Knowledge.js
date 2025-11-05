// models/Knowledge.js
import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Knowledge", knowledgeSchema);
