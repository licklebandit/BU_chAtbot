// frontend/src/components/SuggestedQuestions.js
import React from "react";
import { Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const SuggestedQuestions = ({ questions = [], onQuestionClick, className = "" }) => {
  const { isDark } = useTheme();

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Sparkles
          className={`h-4 w-4 ${
            isDark ? "text-yellow-400" : "text-yellow-500"
          }`}
        />
        <span
          className={`text-xs font-medium ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          Suggested questions:
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 border ${
              isDark
                ? "bg-slate-800/50 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-blue-500"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-blue-500 hover:shadow-sm"
            }`}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
