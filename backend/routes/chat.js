import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";

dotenv.config();
const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load Bugema knowledge base (simple JSON file)
const knowledgePath = "./data/knowledge.json";
let knowledge = [];

if (fs.existsSync(knowledgePath)) {
  const fileData = fs.readFileSync(knowledgePath, "utf8");
  try {
    knowledge = JSON.parse(fileData);
  } catch (error) {
    console.error("⚠️ Error parsing knowledge.json:", error);
  }
} else {
  console.warn("⚠️ knowledge.json not found. The chatbot may have limited answers.");
}

router.post("/", async (req, res) => {
  const { q } = req.body;

  if (!q || q.trim() === "") {
    return res.status(400).json({ answer: "Please ask a valid question." });
  }

  // Try to match question with Bugema knowledge base
  let context = "You are Bugema University’s AI assistant. Be polite, helpful, and accurate.";
  let found = knowledge.find(item =>
    q.toLowerCase().includes(item.keyword.toLowerCase())
  );

  if (found) {
    context += `\nRelevant info: ${found.answer}`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-3.5-turbo" if cheaper
      messages: [
        { role: "system", content: context },
        { role: "user", content: q },
      ],
    });

    const answer = completion.choices[0].message.content.trim();
    res.json({ answer });
  } catch (error) {
    console.error("❌ Chat route error:", error);
    res.status(500).json({
      answer: "Sorry, I couldn’t process your request right now.",
    });
  }
});

export default router;
