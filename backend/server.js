// server.js - UPDATED WITH NOTIFICATION FUNCTIONALITY
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server as IOServer } from "socket.io";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// ✅ Import all routes
import chatRoute from "./routes/chat.js";
import ingestRoute from "./routes/ingest.js";
import authRoute from "./routes/auth.js";
import adminRouter from "./routes/adminRouter.js";
import conversationRouter from "./routes/conversations.js";
import analyticsRouter from "./routes/analytics.js";
import settingsRouter from "./routes/settings.js";
import feedbackRouter from "./routes/feedback.js";
import simpleChatRoute from "./routes/simpleChat.js";
import testKbRoute from "./routes/test_kb.js";
import { detectIntent } from "./utils/intentClassifier.js";
import { getVariationsForKeyword } from "./utils/questionVariations.js";
import healthRoutes from './routes/health.js';

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

// ✅ Warm up the knowledge base on startup
function warmUpKnowledgeBase() {
    console.log("\n🔥 Warming up knowledge base...");
    
    // Pre-load and test common queries
    const testQueries = [
        "admission requirements",
        "tuition fees", 
        "courses offered",
        "library hours",
        "contact information",
        "who is the vc",
        "where is the library",
        "library location",
        "how to apply",
        "fee payment",
        "where can i find books"
    ];
    
    // Simple warm-up by loading and parsing KB
    const kbPath = path.join(__dirname, 'data', 'knowledge.json');
    if (fs.existsSync(kbPath)) {
        try {
            const data = fs.readFileSync(kbPath, 'utf8');
            const kb = JSON.parse(data);
            console.log(`✅ Knowledge base loaded: ${kb.length} entries`);
            
            // Test search speed
            console.log("🧪 Testing common queries:");
            testQueries.forEach(query => {
                const start = Date.now();
                // Test intent detection
                const intent = detectIntent(query);
                const time = Date.now() - start;

                // Simple match test
                const found = kb.some(item => {
                  const keyword = item.keyword.toLowerCase();
                  const synonyms = item.synonyms || [];
                  return query.toLowerCase().includes(keyword) ||
                          synonyms.some(syn => query.toLowerCase().includes(syn.toLowerCase()));
                });

                console.log(`   "${query}": ${found ? '✅' : '❌'} (${time}ms) - Intent: ${intent.intent}`);
            });
            
            console.log("✅ Knowledge base warmed up successfully!");
            
        } catch (error) {
            console.error("❌ Warm-up error:", error.message);
            console.log("⚠️  Knowledge base warm-up failed, but server will continue...");
        }
    } else {
        console.error(`❌ Knowledge file not found at: ${kbPath}`);
        console.log("⚠️  Creating default knowledge.json...");
        
        // Create default knowledge base
        const defaultKnowledge = [
            {
                "keyword": "admission requirements",
                "answer": "To be admitted to Bugema University, applicants must present their academic certificates and meet the minimum entry requirements.",
                "category": "admissions",
                "tags": ["admissions", "requirements"],
                "priority": 1,
                "synonyms": ["entry requirements", "how to apply", "admission process"]
            }
        ];
        
        // Ensure directory exists
        const dirPath = path.dirname(kbPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        fs.writeFileSync(kbPath, JSON.stringify(defaultKnowledge, null, 2), 'utf8');
        console.log(`✅ Created default knowledge.json at: ${kbPath}`);
    }
}

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

// ✅ Socket.IO Events with Notification Functionality
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("joinAdminRoom", () => {
    socket.join("adminRoom");
    console.log(`👨‍💼 Admin ${socket.id} joined admin room`);
    
    // Send welcome notification to the admin
    socket.emit("newNotification", {
      id: Date.now(),
      title: "Welcome Admin!",
      message: "You have successfully connected to the admin panel.",
      type: "success",
      timestamp: new Date().toISOString(),
      read: false
    });
  });

  // ✅ Handle admin reading notifications
  socket.on("adminReadNotifications", (data) => {
    const adminId = data?.adminId || socket.id;
    console.log(`📭 Admin ${adminId} has read notifications`);
    
    // Optional: Update database to mark notifications as read
    // Example (uncomment when you have a Notification model):
    /*
    try {
      await NotificationModel.updateMany(
        { recipient: adminId, read: false },
        { $set: { read: true, readAt: new Date() } }
      );
      console.log(`✅ Marked notifications as read for admin ${adminId}`);
    } catch (error) {
      console.error("❌ Error updating notifications:", error.message);
    }
    */
    
    // Broadcast to all admins to clear notifications UI
    io.to("adminRoom").emit("clearNotificationsUI", {
      clearedBy: adminId,
      timestamp: new Date().toISOString(),
      notificationIds: data?.notificationIds || []
    });
  });

  // ✅ Handle test notifications (for frontend testing)
  socket.on("testNotification", (data) => {
    console.log("🧪 Test notification received:", data);
    
    const testNotification = {
      id: Date.now(),
      title: data.title || "Test Notification",
      message: data.message || "This is a test notification from the server",
      type: data.type || "info",
      timestamp: new Date().toISOString(),
      read: false,
      source: "test"
    };
    
    // Broadcast test notification to all admins
    io.to("adminRoom").emit("newNotification", testNotification);
    
    // Send confirmation back to sender
    socket.emit("testNotificationSent", {
      success: true,
      notification: testNotification,
      sentTo: "adminRoom"
    });
  });

  // ✅ Handle user sending message (example for notifications)
  socket.on("userMessage", (data) => {
    console.log("💬 User message received:", data.userId);
    
    // Create a notification for admins about new user message
    const adminNotification = {
      id: Date.now(),
      title: "New User Message",
      message: `User ${data.userId || 'Anonymous'} sent a new message: "${data.message?.substring(0, 50)}..."`,
      type: "info",
      timestamp: new Date().toISOString(),
      read: false,
      userId: data.userId,
      messageId: data.messageId
    };
    
    // Notify all admins
    io.to("adminRoom").emit("newNotification", adminNotification);
  });

  // ✅ Handle feedback submission
  socket.on("newFeedback", (data) => {
    console.log("🌟 New feedback received:", data.feedbackId);
    
    const feedbackNotification = {
      id: Date.now(),
      title: "New User Feedback",
      message: `New ${data.rating || 5}-star feedback received: "${data.comment?.substring(0, 50)}..."`,
      type: data.rating >= 4 ? "success" : data.rating >= 3 ? "warning" : "error",
      timestamp: new Date().toISOString(),
      read: false,
      feedbackId: data.feedbackId,
      rating: data.rating
    };
    
    // Notify all admins
    io.to("adminRoom").emit("newNotification", feedbackNotification);
  });

  // ✅ Handle system alerts
  socket.on("systemAlert", (data) => {
    console.log("🚨 System alert:", data.message);
    
    const alertNotification = {
      id: Date.now(),
      title: data.title || "System Alert",
      message: data.message,
      type: data.type || "warning",
      timestamp: new Date().toISOString(),
      read: false,
      priority: data.priority || "medium"
    };
    
    // Broadcast to all connected clients (including admins)
    io.emit("newNotification", alertNotification);
  });

  // ✅ Handle notification mark as read (individual)
  socket.on("markNotificationRead", (data) => {
    console.log(`📌 Notification ${data.notificationId} marked as read by ${socket.id}`);
    
    // Update database (example):
    /*
    await NotificationModel.findByIdAndUpdate(data.notificationId, {
      read: true,
      readAt: new Date()
    });
    */
    
    // Acknowledge to sender
    socket.emit("notificationMarkedRead", {
      notificationId: data.notificationId,
      success: true
    });
  });

  // ✅ Handle admin typing status
  socket.on("adminTyping", (data) => {
    // Broadcast to other admins that someone is typing
    socket.to("adminRoom").emit("adminTypingStatus", {
      adminId: socket.id,
      isTyping: data.isTyping,
      room: data.room
    });
  });

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    
    // Notify other admins about disconnection
    socket.to("adminRoom").emit("adminDisconnected", {
      adminId: socket.id,
      timestamp: new Date().toISOString()
    });
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

// --- DATABASE ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- ROUTES ---
app.use("/api/chat", chatRoute);
app.use("/api/admin/ingest", ingestRoute);
app.use("/auth", authRoute);
app.use("/api/admin", adminRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/admin/analytics", analyticsRouter);
app.use("/api/admin/settings", settingsRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/simple", simpleChatRoute);
app.use("/api/test", testKbRoute);
app.use('/api/health', healthRoutes);

// ✅ NEW: Notification endpoints for REST API
app.post("/api/notifications/test", (req, res) => {
  const { title, message, type } = req.body;
  
  const testNotification = {
    id: Date.now(),
    title: title || "Test Notification",
    message: message || "This is a test notification sent via REST API",
    type: type || "info",
    timestamp: new Date().toISOString(),
    read: false,
    source: "rest-api"
  };
  
  // Broadcast to all admins
  io.to("adminRoom").emit("newNotification", testNotification);
  
  res.json({
    success: true,
    message: "Test notification sent to all admins",
    notification: testNotification
  });
});

app.get("/api/notifications/status", (req, res) => {
  const adminRoom = io.sockets.adapter.rooms.get("adminRoom");
  const adminCount = adminRoom ? adminRoom.size : 0;
  
  res.json({
    status: "active",
    connectedAdmins: adminCount,
    timestamp: new Date().toISOString(),
    endpoints: {
      websocket: "ws://" + req.headers.host,
      test: "POST /api/notifications/test",
      clear: "Socket event: adminReadNotifications"
    }
  });
});

// ✅ NEW: Broadcast notification to all admins (for other routes to use)
export function broadcastToAdmins(event, data) {
  io.to("adminRoom").emit(event, data);
}

// ✅ NEW: Send system notification helper
export function sendSystemNotification(title, message, type = "info") {
  const notification = {
    id: Date.now(),
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
    source: "system"
  };
  
  io.to("adminRoom").emit("newNotification", notification);
  return notification;
}

// --- HEALTH CHECK ---
app.get("/", (req, res) => {
  res.send("🎓 Bugema University AI Chatbot backend running successfully...");
});

// --- HEALTH CHECK WITH KB STATUS & SOCKET INFO ---
app.get("/health", (req, res) => {
  const kbPath = path.join(__dirname, 'data', 'knowledge.json');
  const kbExists = fs.existsSync(kbPath);
  let kbCount = 0;
  
  if (kbExists) {
    try {
      const data = fs.readFileSync(kbPath, 'utf8');
      const kb = JSON.parse(data);
      kbCount = kb.length;
    } catch (error) {
      // Ignore parse errors for health check
    }
  }
  
  // Get socket.io stats
  const adminRoom = io.sockets.adapter.rooms.get("adminRoom");
  const adminCount = adminRoom ? adminRoom.size : 0;
  const totalConnections = io.engine.clientsCount;
  
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    knowledge_base: {
      exists: kbExists,
      entries: kbCount,
      path: kbPath
    },
    websocket: {
      total_connections: totalConnections,
      connected_admins: adminCount,
      admin_room_active: adminCount > 0
    },
    environment: process.env.NODE_ENV || "development",
    rag_mode: process.env.RAG_MODE || "not set",
    notification_system: "active"
  });
});

// ✅ NEW: Socket.io test endpoint
app.get("/api/socket-test", (req, res) => {
  const totalConnections = io.engine.clientsCount;
  const adminRoom = io.sockets.adapter.rooms.get("adminRoom");
  const adminCount = adminRoom ? adminRoom.size : 0;
  
  res.json({
    success: true,
    message: "Socket.IO is running",
    stats: {
      total_connections: totalConnections,
      admin_connections: adminCount,
      uptime: process.uptime()
    },
    endpoints: {
      websocket: `ws://${req.headers.host}/socket.io/`,
      health: "/health",
      notification_test: "POST /api/notifications/test"
    }
  });
});

// ✅ NEW: Error handling middleware (should be after all routes)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('❌ Stack:', err.stack);
  
  // Send error notification to admins
  if (io) {
    const errorNotification = {
      id: Date.now(),
      title: "Server Error",
      message: `Error in ${req.method} ${req.path}: ${err.message}`,
      type: "error",
      timestamp: new Date().toISOString(),
      read: false,
      source: "error-handler"
    };
    
    io.to("adminRoom").emit("newNotification", errorNotification);
  }
  
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
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/chat/test-kb`);
  console.log(`🔌 Socket.IO endpoint: ws://localhost:${PORT}`);
  console.log(`🔔 Notification test: POST http://localhost:${PORT}/api/notifications/test`);
  console.log(`👨‍💼 Admin room ready for connections`);
  
  // Call warm-up AFTER server starts listening
  setTimeout(() => {
    warmUpKnowledgeBase();
    
    // Send startup notification to any connected admins
    setTimeout(() => {
      if (io) {
        const startupNotification = {
          id: Date.now(),
          title: "Server Started",
          message: `Bugema University AI Chatbot server started successfully on port ${PORT}`,
          type: "success",
          timestamp: new Date().toISOString(),
          read: false,
          source: "system-startup"
        };
        
        io.to("adminRoom").emit("newNotification", startupNotification);
        console.log("✅ Startup notification sent to admin room");
      }
    }, 2000);
  }, 1000); // Wait 1 second for everything to initialize
});