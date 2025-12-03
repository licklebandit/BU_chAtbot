import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { getConversationStats } from "../controllers/conversationController.js";
import Chat from "../models/Chat.js";

const router = express.Router();

const normalizeMessages = (messages = []) =>
  messages.map((msg) => ({
    sender: msg.role,
    text: msg.text,
    content: msg.text,
    timestamp: msg.timestamp,
  }));

const mapChatToConversation = (chat) => {
  const normalizedMessages = normalizeMessages(chat.messages || []);
  const lastMessage =
    normalizedMessages[normalizedMessages.length - 1]?.text ||
    "No messages yet";
  const firstUserMessage =
    normalizedMessages.find((m) => m.sender === "user")?.text || "";

  return {
    _id: chat._id,
    userId: chat.userId?._id || chat.userId,
    user_name: chat.userId?.name || chat.userId?.email || "Guest user",
    userEmail: chat.userId?.email,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    snippet: firstUserMessage.slice(0, 200),
    lastMessage,
    messageCount: normalizedMessages.length,
    messages: normalizedMessages,
    isUnread: chat.isUnread,
  };
};

// --- Conversation statistics ---
router.get("/stats", verifyAdmin, getConversationStats);

// --- Get all conversations for admin dashboard ---
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const chats = await Chat.find()
      .sort({ updatedAt: -1 })
      .limit(100)
      .populate("userId", "name email");

    res.json(chats.map(mapChatToConversation));
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json([]);
  }
});

// --- Get recent conversations (lightweight) ---
router.get("/recent", verifyAdmin, async (req, res) => {
  try {
    const chats = await Chat.find()
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate("userId", "name email");

    res.json(
      chats.map((chat) => ({
        _id: chat._id,
        user_name: chat.userId?.name || chat.userId?.email || "Guest user",
        updatedAt: chat.updatedAt,
        snippet: chat.messages?.[0]?.text || "",
        isUnread: chat.isUnread,
      })),
    );
  } catch (error) {
    console.error("Error getting recent conversations:", error);
    res.status(500).json([]);
  }
});

// --- Get user's recent conversations ---
router.get("/user/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId })
      .sort({ updatedAt: -1 })
      .limit(10);
    res.json(
      chats.map((chat) => ({
        _id: chat._id,
        snippet: chat.messages?.[0]?.text || "",
        messages: normalizeMessages(chat.messages),
        updatedAt: chat.updatedAt,
      })),
    );
  } catch (error) {
    console.error("Error getting user conversations:", error);
    res.status(500).json({ message: "Failed to get user conversations" });
  }
});

// --- Get single conversation by ID ---
router.get("/:id", verifyAdmin, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate(
      "userId",
      "name email",
    );
    if (!chat) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.json(mapChatToConversation(chat));
  } catch (error) {
    console.error("Error getting conversation by ID:", error);
    res.status(500).json({ message: "Failed to get conversation" });
  }
});

// --- Mark conversation as read ---
router.put("/:id/read", verifyAdmin, async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { isUnread: false },
      { new: true },
    ).populate("userId", "name email");
    if (!chat) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.json(mapChatToConversation(chat));
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    res.status(500).json({ message: "Failed to mark conversation as read" });
  }
});

// --- Delete conversation ---
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Failed to delete conversation" });
  }
});

export default router;
