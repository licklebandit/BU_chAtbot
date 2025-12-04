// routes/settings.js
import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Simulated settings (replace with DB later)
let chatbotSettings = {
  chatbotName: "BUChatbot",
  defaultResponseTime: 1,
  enableLogging: true,
};

// Require admin auth for all settings routes
router.use(verifyAdmin);

// GET /api/admin/settings
router.get("/", (req, res) => {
  res.json(chatbotSettings);
});

// PUT /api/admin/settings
router.put("/", (req, res) => {
  const { chatbotName, defaultResponseTime, enableLogging } = req.body;
  chatbotSettings = { chatbotName, defaultResponseTime, enableLogging };
  res.json(chatbotSettings);
});

export default router;
