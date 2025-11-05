import React from "react";

export default function ConversationModal({ isOpen, onClose, conversation }) {
  if (!isOpen || !conversation) return null;

  const messages = conversation.messages || []; // assume messages array
  const userName = conversation.user || "Unknown User";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Conversation with {userName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
          {messages.length ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-xs ${
                  msg.sender === "user"
                    ? "bg-blue-100 text-blue-800 self-start"
                    : "bg-gray-100 text-gray-800 self-end"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <span className="text-xs text-gray-400 mt-1 block">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No messages yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
