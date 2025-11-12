// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server as IOServer } from "socket.io";
import helmet from "helmet"; // ✅ NEW: Import helmet for security headers

// ✅ Import all routes
import chatRoute from "./routes/chat.js";
import ingestRoute from "./routes/ingest.js";
import authRoute from "./routes/auth.js";
import adminRouter from "./routes/adminRouter.js";
import conversationRouter from "./routes/conversations.js";
import analyticsRouter from "./routes/analytics.js";
import settingsRouter from "./routes/settings.js";

dotenv.config();

// --- APP SETUP ---
const app = express();
const server = http.createServer(app); // ✅ the only server instance

const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://bu-ch-atbot.vercel.app",
    // Add any other trusted frontend origins here
];

// ✅ Initialize Socket.IO
const io = new IOServer(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ✅ Socket.IO Events (Unchanged)
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

// 1. ✅ NEW: Add Helmet for security headers, including the CSP fix
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" }, // Necessary for static assets
    })
);

// 2. ✅ CSP Configuration to allow 'eval' for libraries like Tailwind JIT/certain dependencies
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            // 👇 THIS IS THE FIX: Allows dynamic execution for certain libraries
            scriptSrc: ["'self'", "'unsafe-eval'", ...ALLOWED_ORIGINS], 
            styleSrc: ["'self'", "'unsafe-inline'", ...ALLOWED_ORIGINS], // 'unsafe-inline' often needed for Tailwind JIT/styled components
            imgSrc: ["'self'", "data:", ...ALLOWED_ORIGINS],
            connectSrc: ["'self'", ...ALLOWED_ORIGINS, "ws:", "wss:"], // Allows websocket/API connections
        },
    })
);


// 3. CORS Configuration (Unchanged)
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// --- DATABASE (Unchanged) ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- ROUTES (Unchanged) ---
app.use("/chat", chatRoute);
app.use("/api/ingest", ingestRoute);
app.use("/auth", authRoute);
app.use("/api/admin", adminRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/admin/analytics", analyticsRouter);
app.use("/api/admin/settings", settingsRouter);

// --- HEALTH CHECK (Unchanged) ---
app.get("/", (req, res) => {
  res.send("🎓 Bugema University AI Chatbot backend running successfully...");
});

// --- SERVER START (Unchanged) ---
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("🔑 Gemini API Key:", process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No");
  console.log("🧩 JWT Secret:", process.env.JWT_SECRET ? "✅ Yes" : "❌ No");
  console.log("🌍 Environment:", process.env.NODE_ENV || "development");
});