import React from "react";

export default function AdminModal({ message, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <p className="text-gray-800 font-semibold mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          {onConfirm && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition"
            >
              Confirm Delete
            </button>
          )}
          {!onConfirm && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
