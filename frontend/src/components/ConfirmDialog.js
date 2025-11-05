import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-blue-600 text-white">Confirm</button>
        </div>
      </div>
    </div>
  );
}
