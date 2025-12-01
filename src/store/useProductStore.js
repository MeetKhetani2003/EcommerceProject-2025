"use client";
import { create } from "zustand";

export const useProductsStore = create((set, get) => ({
  products: [],
  page: 1,
  hasMore: true,
  filters: {
    category: null,
    size: null,
    flag: null,
  },

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      page: 1,
      products: [],
      hasMore: true,
    })),

  fetchProducts: async () => {
    if (!get().hasMore) return;

    const { page, filters, products } = get();
    const query = new URLSearchParams({
      page,
      limit: 20,
      ...filters,
    }).toString();

    const res = await fetch(`/api/products?${query}`);
    const data = await res.json();

    if (data.products.length === 0) {
      set({ hasMore: false });
      return;
    }

    set({
      products: [...products, ...data.products],
      page: page + 1,
    });
  },
}));
