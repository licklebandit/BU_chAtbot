import express from "express";
import OpenAI from "openai";
import { searchSimilar } from "../utils/vectorStore.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  const { q } = req.body;
  if (!q) return res.status(400).json({ error: "Question required" });

  const results = await searchSimilar(q, 4);
  const context = results.map(r => `Source: ${r.source}\n${r.chunk}`).join("\n\n");

  const prompt = `
You are Bugema University Assistant. Use the provided context to answer user questions accurately.
If you don't know the answer, say you don't know.
Context:\n${context}\n
Question: ${q}
Answer:
  `;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const answer = completion.choices[0].message.content;

  res.json({ answer, sources: results.map(r => r.source) });
});

export default router;