import express from "express";
import { chunkText } from "../utils/chunker.js";
import { addDocumentChunks } from "../utils/vectorStore.js";
import fetch from "node-fetch";

const router = express.Router();

router.post("/url", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  const response = await fetch(url);
  const html = await response.text();
  const text = html.replace(/<[^>]*>/g, " "); // basic HTML strip
  const chunks = chunkText(text);
  await addDocumentChunks(chunks, url);
  res.json({ added: chunks.length });
});

router.post("/text", async (req, res) => {
  const { text, source } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });
  const chunks = chunkText(text);
  await addDocumentChunks(chunks, source || "manual");
  res.json({ added: chunks.length });
});

export default router;