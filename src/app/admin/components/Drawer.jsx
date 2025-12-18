"use client";
import React from "react";

export default function Drawer({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40" onClick={onClose}></div>
      <div className="ml-auto w-full md:w-1/3 bg-white p-4 overflow-auto">
        <button className="mb-2 text-sm text-gray-500" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    </div>
  );
}
