"use client";
import React from "react";

export default function Table({ columns = [], data = [], renderRow }) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="text-left text-sm text-gray-600">
          {columns.map((c) => (
            <th key={c} className="p-2">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="p-4 text-center text-gray-500"
            >
              No records
            </td>
          </tr>
        ) : (
          data.map((row) => renderRow(row))
        )}
      </tbody>
    </table>
  );
}
