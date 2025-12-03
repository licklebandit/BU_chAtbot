// frontend/src/components/ExportChatButton.js
import React, { useState } from "react";
import { Download, FileText, FileJson, File } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { useTheme } from "../context/ThemeContext";

const ExportChatButton = ({ chatId, className = "" }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { isDark } = useTheme();

  const exportChat = async (format) => {
    if (!chatId) {
      alert("No chat history to export");
      return;
    }

    setExporting(true);
    setShowMenu(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to export chat history");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        responseType: format === "pdf" || format === "txt" ? "blob" : "json",
      };

      const response = await axios.get(
        `${API_BASE_URL}/feedback/export/${format}/${chatId}`,
        config
      );

      // Handle different formats
      if (format === "pdf") {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `chat-history-${chatId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (format === "txt") {
        const blob = new Blob([response.data], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `chat-history-${chatId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (format === "json") {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `chat-history-${chatId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      alert(`Chat history exported successfully as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error("Error exporting chat:", error);
      alert(
        error.response?.data?.message ||
          "Failed to export chat history. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
          isDark
            ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Export chat history"
      >
        <Download className="h-4 w-4" />
        <span className="text-sm">Export</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          ></div>

          {/* Export menu */}
          <div
            className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-20 ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="p-2 space-y-1">
              <button
                onClick={() => exportChat("pdf")}
                disabled={exporting}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isDark
                    ? "hover:bg-slate-700 text-slate-200"
                    : "hover:bg-slate-100 text-slate-700"
                } disabled:opacity-50`}
              >
                <File className="h-4 w-4 text-red-500" />
                <span>Export as PDF</span>
              </button>

              <button
                onClick={() => exportChat("json")}
                disabled={exporting}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isDark
                    ? "hover:bg-slate-700 text-slate-200"
                    : "hover:bg-slate-100 text-slate-700"
                } disabled:opacity-50`}
              >
                <FileJson className="h-4 w-4 text-blue-500" />
                <span>Export as JSON</span>
              </button>

              <button
                onClick={() => exportChat("txt")}
                disabled={exporting}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isDark
                    ? "hover:bg-slate-700 text-slate-200"
                    : "hover:bg-slate-100 text-slate-700"
                } disabled:opacity-50`}
              >
                <FileText className="h-4 w-4 text-green-500" />
                <span>Export as TXT</span>
              </button>
            </div>

            {exporting && (
              <div
                className={`px-3 py-2 text-xs text-center border-t ${
                  isDark
                    ? "border-slate-700 text-slate-400"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                Exporting...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportChatButton;
