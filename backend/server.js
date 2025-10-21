import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// ✅ Import routes
import chatRoute from "./routes/chat.js";
import ingestRoute from "./routes/ingest.js";
import authRoute from "./routes/auth.js"; // For login/signup (optional for admin panel)

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize app
const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://your-frontend.vercel.app"], // adjust for your actual frontend
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// ✅ MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ API Routes
app.use("/chat", chatRoute); // Handles user chat with hybrid logic
app.use("/ingest", ingestRoute); // Admin adds new knowledge entries
app.use("/auth", authRoute); // Admin login/signup routes

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("🎓 Bugema University AI Chatbot backend running successfully...");
});

// ✅ Start the Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("🔑 Loaded OpenAI Key:", process.env.OPENAI_API_KEY ? "✅ Yes" : "❌ No");
  console.log("🧩 JWT Secret:", process.env.JWT_SECRET ? "✅ Yes" : "❌ No");
  console.log("🌍 Environment:", process.env.NODE_ENV || "development");
});
