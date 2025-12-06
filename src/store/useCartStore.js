"use client";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useCartStore = create((set) => ({
  cart: [],

  fetchCart: async () => {
    const res = await fetch("/api/user/cart", { credentials: "include" });
    const data = await res.json();
    set({ cart: data });
  },

  addToCart: async (product) => {
    if (product?.size) product.selectedSize = product.size;

    if (!product?._id || !product?.selectedSize) {
      toast.error("Select a size first! 😒");
      return;
    }

    try {
      const res = await fetch("/api/user/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          size: product.selectedSize,
        }),
      });

      const data = await res.json();

      // 🔥 LOGIN NOT DONE
      if (res.status === 401) {
        toast.error("Login Required 🔐");
        window.location.href = "/auth";
        return;
      }

      // 🔥 BACKEND ERROR
      if (!data.success) {
        toast.error(data.message || "Something went wrong 😵");
        return;
      }

      // 🔥 SUCCESS
      toast.success(`Added to cart 🛍️ (Size: ${product.selectedSize})`);
    } catch (error) {
      toast.error("Server error 💀 Try again.");
      console.error(error);
    }

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
  cartCount: () => {
    return useCartStore.getState().cart.reduce((t, item) => t + item.qty, 0);
  },
}));
