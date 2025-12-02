import React from "react";
import { User, Bot, Clock } from "lucide-react";

const formatTimestamp = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const normalizeMessage = (message, index) => {
  const role = message?.role || message?.sender || "assistant";
  return {
    role,
    text: message?.text || message?.content || "",
    timestamp: message?.timestamp || message?.createdAt || message?.updatedAt || new Date().toISOString(),
    id: message?._id || `${role}-${index}`,
  };
};

export default function ConversationModal({ isOpen, onClose, conversation }) {
  if (!isOpen || !conversation) return null;

  const messages = (conversation.messages || []).map(normalizeMessage);
  const userName = conversation.user || conversation.user_name || "Unknown User";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Conversation</p>
            <h2 className="text-xl font-semibold text-slate-900">With {userName}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <Clock className="w-4 h-4" />
              {conversation.updatedAt ? formatTimestamp(conversation.updatedAt) : "Recently updated"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 text-2xl leading-none font-semibold"
            aria-label="Close conversation"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50 space-y-4">
          {messages.length ? (
            messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
                      isUser
                        ? "bg-blue-50 text-blue-900 border border-blue-100"
                        : "bg-slate-900 text-white border border-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide mb-1 opacity-70">
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      {isUser ? "User" : "Assistant"}
                    </div>
                    <p className="whitespace-pre-line">{message.text}</p>
                    <p className={`text-[11px] mt-2 opacity-70 ${isUser ? "text-blue-900" : "text-slate-100"}`}>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-slate-500 text-sm py-10 bg-white rounded-2xl border border-dashed border-slate-200">
              No messages found for this conversation.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total messages: <span className="font-semibold text-slate-800">{messages.length}</span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center px-5 py-2 rounded-2xl bg-slate-900 text-white font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
