import mongoose from "mongoose";

const KnowledgeSchema = new mongoose.Schema({
  keyword: { type: String, required: true, unique: true },
  answer: { type: String, required: true },
});

export default mongoose.model("Knowledge", KnowledgeSchema);
