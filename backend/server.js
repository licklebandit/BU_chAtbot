import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoute from "./routes/chat.js";
import ingestRoute from "./routes/ingest.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ Routes
app.use("/chat", chatRoute);
app.use("/ingest", ingestRoute);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🎓 Bugema University AI Chatbot backend running...");
});

// ✅ Server start
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("🔑 Loaded OpenAI Key:", process.env.OPENAI_API_KEY ? "✅ Yes" : "❌ No");
});
