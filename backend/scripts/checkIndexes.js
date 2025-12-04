// backend/scripts/checkIndexes.js
import mongoose from "mongoose";
import Knowledge from "../models/Knowledge.js";
import dotenv from "dotenv";

dotenv.config();

async function checkAndCreateIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    const db = mongoose.connection.db;
    const collection = db.collection("knowledges");
    
    console.log("\n📋 Checking existing indexes...");
    const indexes = await collection.indexes();
    
    // Log all indexes
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });
    
    // Check if text index exists
    const hasTextIndex = indexes.some(idx => idx.name === "question_text_answer_text");
    
    if (!hasTextIndex) {
      console.log("\n🔧 Creating text index for search...");
      await collection.createIndex(
        { question: "text", answer: "text" },
        { 
          name: "question_text_answer_text",
          default_language: "english",
          weights: { question: 10, answer: 5 }
        }
      );
      console.log("✅ Text index created successfully");
    } else {
      console.log("\n✅ Text index already exists");
    }
    
    // Check and create other useful indexes
    const usefulIndexes = [
      { key: { isActive: 1 }, name: "isActive_index" },
      { key: { category: 1 }, name: "category_index" },
      { key: { priority: -1 }, name: "priority_index" },
      { key: { views: -1 }, name: "views_index" }
    ];
    
    for (const idx of usefulIndexes) {
      const exists = indexes.some(existing => existing.name === idx.name);
      if (!exists) {
        console.log(`🔧 Creating ${idx.name}...`);
        await collection.createIndex(idx.key, { name: idx.name });
        console.log(`✅ ${idx.name} created`);
      } else {
        console.log(`✅ ${idx.name} already exists`);
      }
    }
    
    console.log("\n✅ All indexes are properly configured!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

checkAndCreateIndexes();