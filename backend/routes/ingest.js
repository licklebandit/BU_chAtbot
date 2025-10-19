import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Define path to the knowledge file
const dataFile = path.resolve("data", "knowledge.json");

// 🧾 GET all knowledge items
router.get("/", (req, res) => {
  try {
    const data = fs.existsSync(dataFile)
      ? JSON.parse(fs.readFileSync(dataFile))
      : [];
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read knowledge file" });
  }
});

// 💾 POST: Add or update a knowledge item
router.post("/", (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer)
    return res.status(400).json({ error: "Both question and answer are required" });

  try {
    const data = fs.existsSync(dataFile)
      ? JSON.parse(fs.readFileSync(dataFile))
      : [];

    const existingIndex = data.findIndex(
      (item) => item.question.toLowerCase() === question.toLowerCase()
    );

    if (existingIndex >= 0) {
      data[existingIndex].answer = answer; // Update existing
    } else {
      data.push({ question, answer });
    }

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: "Failed to write knowledge file" });
  }
});

export default router;
