// backend/models/Knowledge.js - UPDATED
import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: "academic",
      enum: ["academic", "administrative", "admissions", "fees", "courses", "campus", "technical", "other"]
    },
    tags: [{
      type: String,
      trim: true
    }],
    type: { 
      type: String, 
      enum: ["knowledge", "faq"], 
      default: "knowledge" 
    },
    source: { 
      type: String, 
      default: "Admin Panel",
      enum: ["Admin Panel", "JSON Import", "JSON File"]
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Create text index for search
knowledgeSchema.index({ question: 'text', answer: 'text' });

export default mongoose.model("Knowledge", knowledgeSchema);