"use client";
import { create } from "zustand";

export const useCartStore = create((set) => ({
  cart: [],

  fetchCart: async () => {
    const res = await fetch("/api/user/cart", { credentials: "include" });
    const data = await res.json();
    set({ cart: data });
  },

  addToCart: async (product) => {
    console.log("Oye dekh", product);
    if (product?.size) {
      product.selectedSize = product.size;
    }
    console.log("Idhar oye pagal", product);

    if (!product?._id || !product?.selectedSize) {
      console.warn("❌ Missing productId or size in addToCart");
      return;
    }

    await fetch("/api/user/cart", {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product._id,
        size: product.selectedSize,
      }),
    });

    await useCartStore.getState().fetchCart();
  },

  updateQty: async (productId, size, qty) => {
    await fetch(`/api/user/cart?productId=${productId}&size=${size}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty }),
    });

    await useCartStore.getState().fetchCart();
  },

  removeFromCart: async (productId, size) => {
    await fetch(`/api/user/cart?productId=${productId}&size=${size}`, {
      method: "DELETE",
      credentials: "include",
    });

    await useCartStore.getState().fetchCart();
  },
}));
