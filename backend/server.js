import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoute from "./routes/chat.js";
import ingestRoute from "./routes/ingest.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/chat", chatRoute);
app.use("/ingest", ingestRoute);

app.get("/", (req, res) => res.send("Bugema AI Chatbot backend running..."));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));