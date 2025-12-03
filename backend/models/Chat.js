import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        intent: {
          type: String,
          enum: [
            "admissions",
            "academics",
            "fees",
            "scholarships",
            "campus_life",
            "hostel",
            "faculty",
            "programs",
            "registration",
            "graduation",
            "support",
            "emergency",
            "other",
          ],
          default: "other",
        },
        confidence: {
          type: Number,
          min: 0,
          max: 1,
          default: 0,
        },
        feedback: {
          rating: {
            type: String,
            enum: ["positive", "negative", "none"],
            default: "none",
          },
          comment: String,
          timestamp: Date,
        },
        hasMedia: {
          type: Boolean,
          default: false,
        },
        mediaUrls: [String],
      },
    ],
    isUnread: { type: Boolean, default: false },
    sessionData: {
      language: {
        type: String,
        enum: ["en", "lg", "sw"], // English, Luganda, Swahili
        default: "en",
      },
      lastActive: {
        type: Date,
        default: Date.now,
      },
      deviceInfo: {
        type: String,
        default: "",
      },
      ipAddress: {
        type: String,
        default: "",
      },
    },
    tags: [String],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "low",
    },
    status: {
      type: String,
      enum: ["active", "resolved", "escalated", "archived"],
      default: "active",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
chatSchema.index({ userId: 1, updatedAt: -1 });
chatSchema.index({ "messages.intent": 1 });
chatSchema.index({ status: 1, priority: 1 });
chatSchema.index({ isUnread: 1 });
chatSchema.index({ "sessionData.lastActive": 1 });

// Update lastActive on save
chatSchema.pre("save", function (next) {
  if (this.sessionData) {
    this.sessionData.lastActive = new Date();
  }
  next();
});

export default mongoose.model("Chat", chatSchema);
