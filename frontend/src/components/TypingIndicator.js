// frontend/src/components/TypingIndicator.js
import React from "react";
import { useTheme } from "../context/ThemeContext";

const TypingIndicator = () => {
  const { isDark } = useTheme();

  return (
    <div className="flex justify-start mb-4">
      <div
        className={`max-w-xs sm:max-w-md md:max-w-lg rounded-3xl rounded-bl-sm px-4 py-3 shadow-md transition ${
          isDark
            ? "bg-slate-800/70 border border-slate-700/70"
            : "bg-white border border-slate-200"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? "bg-slate-400" : "bg-slate-600"
            }`}
            style={{ animationDelay: "0ms", animationDuration: "1000ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? "bg-slate-400" : "bg-slate-600"
            }`}
            style={{ animationDelay: "150ms", animationDuration: "1000ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? "bg-slate-400" : "bg-slate-600"
            }`}
            style={{ animationDelay: "300ms", animationDuration: "1000ms" }}
          ></div>
          <span
            className={`ml-2 text-xs ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            BUchatbot is thinking...
          </span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
