// frontend/src/components/FeedbackButton.js
import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import axios from "axios"; // ADD THIS IMPORT
import { API_BASE_URL } from "../config/api";

const FeedbackButton = ({ messageId, question, answer, onFeedbackSubmit, chatId }) => {
  const [rating, setRating] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = async (ratingValue) => {
    setRating(ratingValue);
    setShowCommentBox(true);
  };

  const submitFeedback = async () => {
    if (!rating) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      // Build the request payload
      const payload = {
        messageId,
        rating,
        question: question || "User question",
        answer: answer || "Assistant response",
        comment: comment.trim(),
        chatId: chatId || null,
        // category will be auto-detected on backend
      };

      console.log("Submitting feedback:", {
        messageId,
        rating,
        questionLength: question?.length,
        answerLength: answer?.length,
        commentLength: comment?.length,
        chatId
      });

      const response = await axios.post(
        `${API_BASE_URL}/feedback`,
        payload,
        config
      );

      console.log("Feedback submitted successfully:", response.data);

      setSubmitted(true);
      setShowCommentBox(false);

      if (onFeedbackSubmit) {
        onFeedbackSubmit({ rating, comment });
      }

      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowCommentBox(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      console.error("Error response:", error.response?.data);
      alert(`Failed to submit feedback: ${error.response?.data?.message || "Please try again."}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Submit feedback without comment
    if (rating) {
      submitFeedback();
    } else {
      setShowCommentBox(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <span className="text-xs">✓ Thank you for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {!showCommentBox ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Was this helpful?
          </span>
          <button
            onClick={() => handleRating("positive")}
            className={`p-1.5 rounded-lg transition ${
              rating === "positive"
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
            }`}
            title="Helpful"
            disabled={submitting}
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleRating("negative")}
            className={`p-1.5 rounded-lg transition ${
              rating === "negative"
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
            }`}
            title="Not helpful"
            disabled={submitting}
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <MessageSquare className="h-4 w-4" />
            <span>What could we improve? (optional)</span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
            rows={2}
            maxLength={500}
            disabled={submitting}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
            >
              {comment ? "Skip" : "Submit without comment"}
            </button>
            <button
              onClick={submitFeedback}
              disabled={submitting}
              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackButton;