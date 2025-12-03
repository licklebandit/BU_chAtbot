import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous feedback
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: false,
    },
    messageId: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
      enum: ["positive", "negative"],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "admissions",
        "academics",
        "fees",
        "campus_life",
        "hostel",
        "faculty",
        "support",
        "other",
      ],
      default: "other",
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
feedbackSchema.index({ rating: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1 });

export default mongoose.model("Feedback", feedbackSchema);
