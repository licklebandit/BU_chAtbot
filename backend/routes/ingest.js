import express from "express";
import fs from "fs";

const router = express.Router();
const dataPath = "./data/knowledge.json";

// Ensure data folder exists
if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}

// Load existing knowledge base
let knowledge = [];
if (fs.existsSync(dataPath)) {
  knowledge = JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

// ✅ Add or update a knowledge entry
router.post("/", (req, res) => {
  const { keyword, answer } = req.body;

  if (!keyword || !answer) {
    return res.status(400).json({ message: "Both keyword and answer are required." });
  }

  const existingIndex = knowledge.findIndex(item => item.keyword === keyword);

  if (existingIndex !== -1) {
    knowledge[existingIndex].answer = answer;
  } else {
    knowledge.push({ keyword, answer });
  }

  fs.writeFileSync(dataPath, JSON.stringify(knowledge, null, 2));
  res.json({ message: "Knowledge base updated successfully!" });
});

// ✅ View all knowledge entries
router.get("/", (req, res) => {
  res.json(knowledge);
});

export default router;
