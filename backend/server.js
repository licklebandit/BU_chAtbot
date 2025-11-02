// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server as IOServer } from "socket.io";

// ✅ Import all routes
import chatRoute from "./routes/chat.js";
import ingestRoute from "./routes/ingest.js";
import authRoute from "./routes/auth.js";
import adminRouter from "./routes/adminRouter.js";
import conversationRouter from "./routes/conversations.js";

dotenv.config();

// --- APP SETUP ---
const app = express();
const server = http.createServer(app); // ✅ the only server instance

// ✅ Initialize Socket.IO
const io = new IOServer(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://bu-ch-atbot.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ✅ Socket.IO Events
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("joinAdminRoom", () => {
    socket.join("adminRoom");
    console.log(`Admin ${socket.id} joined admin room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Make io available to routes
app.set("io", io);
export { io };

// --- MIDDLEWARES ---
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://bu-ch-atbot.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// --- DATABASE ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- ROUTES ---
app.use("/chat", chatRoute);
app.use("/ingest", ingestRoute);
app.use("/auth", authRoute);
app.use("/api/admin", adminRouter);
app.use("/api/conversations", conversationRouter);

// --- HEALTH CHECK ---
app.get("/", (req, res) => {
  res.send("🎓 Bugema University AI Chatbot backend running successfully...");
});

// --- SERVER START ---
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("🔑 Gemini API Key:", process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No");
  console.log("🧩 JWT Secret:", process.env.JWT_SECRET ? "✅ Yes" : "❌ No");
  console.log("🌍 Environment:", process.env.NODE_ENV || "development");
});
