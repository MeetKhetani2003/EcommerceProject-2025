"use client";
import React from "react";

export default function Pagination({
  page = 1,
  total = 0,
  pageSize = 10,
  onChange,
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-2 py-1 border rounded"
      >
        Prev
      </button>
      <div className="px-3 py-1 border rounded">
        {page} / {pages}
      </div>
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="px-2 py-1 border rounded"
      >
        Next
      </button>
    </div>
  );
}
