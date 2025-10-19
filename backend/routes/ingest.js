import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// ✅ Use a writable directory on Render
const tempDir = "/tmp";
const tempFile = path.join(tempDir, "knowledge.json");

// ✅ Fallback: local file for development
const localFile = path.resolve("data", "knowledge.json");

// Decide file path based on environment
const dataFile = process.env.RENDER ? tempFile : localFile;

// Ensure data file exists
if (!fs.existsSync(dataFile)) {
  const initialData = [];
  fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
}

// 🧾 GET all knowledge items
router.get("/", (req, res) => {
  try {
    const data = fs.existsSync(dataFile)
      ? JSON.parse(fs.readFileSync(dataFile))
      : [];
    res.json(data);
  } catch (err) {
    console.error("❌ Error reading knowledge:", err);
    res.status(500).json({ error: "Failed to read knowledge file" });
  }
});

// 💾 POST: Add or update a knowledge item
router.post("/", (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer)
    return res
      .status(400)
      .json({ error: "Both question and answer are required" });

  try {
    const data = fs.existsSync(dataFile)
      ? JSON.parse(fs.readFileSync(dataFile))
      : [];

    const existingIndex = data.findIndex(
      (item) => item.question.toLowerCase() === question.toLowerCase()
    );

    if (existingIndex >= 0) {
      data[existingIndex].answer = answer;
    } else {
      data.push({ question, answer });
    }

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ Error saving knowledge:", err);
    res.status(500).json({ error: "Failed to save knowledge file" });
  }
});

export default router;
