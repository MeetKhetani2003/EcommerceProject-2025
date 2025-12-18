"use client";
import React, { useEffect, useState } from "react";

export default function ProductForm({
  initial = null,
  onSave,
  loading = false,
}) {
  const [form, setForm] = useState({
    title: "",
    sku: "",
    price: "",
    stock: 0,
    category: "",
  });

  useEffect(() => {
    if (initial)
      setForm({
        title: initial.title || "",
        sku: initial.sku || "",
        price: initial.price || "",
        stock: initial.stock || 0,
        category: initial.category || "",
      });
  }, [initial]);

  function update(key, val) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Title</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm">SKU</label>
          <input
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm">Price</label>
          <input
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm">Category</label>
          <input
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          disabled={loading}
        >
          Save
        </button>
      </div>
    </form>
  );
}
