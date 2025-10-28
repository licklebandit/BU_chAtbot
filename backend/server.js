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

// ✅ CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000", // for local dev
      "https://bu-ch-atbot.vercel.app", // ✅ your actual deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Body parser
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
app.use("/chat", chatRoute);
app.use("/ingest", ingestRoute);
app.use("/auth", authRoute);

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("🎓 Bugema University AI Chatbot backend running successfully...");
});

// ✅ Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("🔑 Gemini API Key:", process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No");
  console.log("🧩 JWT Secret:", process.env.JWT_SECRET ? "✅ Yes" : "❌ No");
  console.log("🌍 Environment:", process.env.NODE_ENV || "development");
});
