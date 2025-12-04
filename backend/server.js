// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server as IOServer } from "socket.io";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Import all routes
import chatRoute from "./routes/chat.js";
import ingestRoute from "./routes/ingest.js";
import authRoute from "./routes/auth.js";
import adminRouter from "./routes/adminRouter.js";
import conversationRouter from "./routes/conversations.js";
import analyticsRouter from "./routes/analytics.js";
import settingsRouter from "./routes/settings.js";
import feedbackRouter from "./routes/feedback.js";

dotenv.config();

// ✅ Environment checks BEFORE anything else
console.log("🔑 Gemini API Key:", process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No");
console.log("🧩 JWT Secret:", process.env.JWT_SECRET ? "✅ Yes" : "❌ No");
console.log("🌍 Environment:", process.env.NODE_ENV || "development");

if (!process.env.GEMINI_API_KEY || !process.env.JWT_SECRET) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// ✅ Setup __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- APP SETUP ---
const app = express();
const server = http.createServer(app);

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://bu-ch-atbot.vercel.app",
];
const envOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = [...new Set([...defaultOrigins, ...envOrigins])];

// ✅ Initialize Socket.IO
const io = new IOServer(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
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

// 1. Helmet for security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. CSP Configuration
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", ...ALLOWED_ORIGINS],
      styleSrc: ["'self'", "'unsafe-inline'", ...ALLOWED_ORIGINS],
      imgSrc: ["'self'", "data:", ...ALLOWED_ORIGINS],
      connectSrc: ["'self'", ...ALLOWED_ORIGINS, "ws:", "wss:"],
    },
  })
);

// 3. CORS Configuration
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ NEW: Serve static frontend build (if you're serving React/Vue from the same server)
// Uncomment if you're building your frontend and placing it in a 'dist' or 'build' folder
// app.use(express.static(path.join(__dirname, 'dist')));

// --- DATABASE ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- ROUTES ---
// Choose ONE of these for chat routes, not both (to avoid duplicate routes)
app.use("/api/chat", chatRoute); // Use this one (more standard)
// app.use("/chat", chatRoute); // Remove or comment this line

app.use("/api/admin/ingest", ingestRoute);
app.use("/auth", authRoute);
app.use("/api/admin", adminRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/admin/analytics", analyticsRouter);
app.use("/api/admin/settings", settingsRouter);
app.use("/api/feedback", feedbackRouter);

// --- HEALTH CHECK ---
app.get("/", (req, res) => {
  res.send("🎓 Bugema University AI Chatbot backend running successfully...");
});

// ✅ NEW: Catch-all route to serve frontend (if serving React/Vue from same server)
// Uncomment if you're serving a frontend from this server
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

// ✅ NEW: Error handling middleware (should be after all routes)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('❌ Stack:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler (should be after all routes but before error handler)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});