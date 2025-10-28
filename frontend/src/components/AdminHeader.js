import React from "react";

export default function AdminHeader({ onLogout }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-extrabold text-indigo-800">
        🛠 Chatbot Admin
      </h1>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-xl transition shadow"
      >
        Logout
      </button>
    </div>
  );
}
