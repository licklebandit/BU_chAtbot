// scripts/fixMongoIndexes.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const fixIndexes = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("knowledges");

    console.log("\n📋 Current indexes on 'knowledges' collection:");
    const indexes = await collection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Check if the problematic keyword_1 index exists
    const hasKeywordIndex = indexes.some((idx) => idx.name === "keyword_1");

    if (hasKeywordIndex) {
      console.log("\n🗑️  Dropping obsolete 'keyword_1' index...");
      await collection.dropIndex("keyword_1");
      console.log("✅ Successfully dropped 'keyword_1' index");
    } else {
      console.log("\n✅ No 'keyword_1' index found (already removed or never existed)");
    }

    console.log("\n📋 Remaining indexes:");
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log("\n✅ Index fix complete!");
  } catch (error) {
    console.error("❌ Error fixing indexes:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
};

fixIndexes();
