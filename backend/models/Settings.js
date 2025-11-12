import express from "express";
import Settings from "../models/Settings.js";

const router = express.Router();

// Middleware: ensure only admins can access (optional)
// router.use(authAdminMiddleware);

// GET /api/admin/settings
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error("Failed to fetch settings:", err);
    res.status(500).json({ message: "Failed to load settings." });
  }
});

// PUT /api/admin/settings
router.put("/", async (req, res) => {
  try {
    const { chatbotName, defaultResponseTime, enableLogging, faqSuggestions, autoUpdateKnowledge } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    if (chatbotName !== undefined) settings.chatbotName = chatbotName;
    if (defaultResponseTime !== undefined) settings.defaultResponseTime = defaultResponseTime;
    if (enableLogging !== undefined) settings.enableLogging = enableLogging;
    if (faqSuggestions !== undefined) settings.faqSuggestions = faqSuggestions;
    if (autoUpdateKnowledge !== undefined) settings.autoUpdateKnowledge = autoUpdateKnowledge;

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error("Failed to update settings:", err);
    res.status(500).json({ message: "Failed to update settings." });
  }
});

export default router;
