import React from "react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-600">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mb-3"></div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
