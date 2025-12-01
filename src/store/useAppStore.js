"use client";

import { create } from "zustand";
import toast from "react-hot-toast";

export const useAppStore = create((set, get) => ({
  wishlist: [],
  cart: [],
  loadingWishlist: false,
  loadingCart: false,

  // --------- WISHLIST ---------
  fetchWishlist: async () => {
    try {
      set({ loadingWishlist: true });
      const res = await fetch("/api/wishlist", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      set({ wishlist: data.wishlist || [] });
    } catch (e) {
      toast.error("Failed to load wishlist");
      console.error("fetchWishlist error:", e);
    } finally {
      set({ loadingWishlist: false });
    }
  },

  addToWishlist: async (product) => {
    try {
      const exists = get().wishlist.some((p) => p._id === product._id);
      if (exists) {
        toast("⚠ Already in wishlist");
        return;
      }

      // Optimistic UI
      set({ wishlist: [...get().wishlist, product] });
      toast.success("❤️ Added to wishlist");

      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product._id }),
      });
    } catch (e) {
      toast.error("Wishlist save failed");
      console.error("addToWishlist error:", e);
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      set({
        wishlist: get().wishlist.filter((p) => p._id !== productId),
      });

      toast("💔 Removed from wishlist");

      await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (e) {
      toast.error("Failed to remove wishlist item");
      console.error("removeFromWishlist error:", e);
    }
  },

  isInWishlist: (id) => get().wishlist.some((p) => p._id === id),

  // --------- CART ---------
  fetchCart: async () => {
    try {
      set({ loadingCart: true });
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();

      const cartItems = (data.cart || []).map((item) => ({
        ...item.product,
        qty: item.qty,
      }));

      set({ cart: cartItems });
    } catch (e) {
      toast.error("Failed to load cart");
      console.error("fetchCart error:", e);
    } finally {
      set({ loadingCart: false });
    }
  },

  addToCart: async (product) => {
    try {
      const existing = get().cart.find((p) => p._id === product._id);
      if (existing) {
        set({
          cart: get().cart.map((p) =>
            p._id === product._id ? { ...p, qty: p.qty + 1 } : p
          ),
        });

        toast("⬆ Quantity updated");
      } else {
        set({ cart: [...get().cart, { ...product, qty: 1 }] });
        toast.success("🛍 Added to cart");
      }

      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product._id, qty: 1 }),
      });
    } catch (e) {
      toast.error("Failed to update cart");
      console.error("addToCart error:", e);
    }
  },

  updateQty: async (productId, qty) => {
    try {
      if (qty < 1) {
        set({
          cart: get().cart.filter((p) => p._id !== productId),
        });
        toast("🗑 Removed from cart");
      } else {
        set({
          cart: get().cart.map((p) =>
            p._id === productId ? { ...p, qty } : p
          ),
        });
        toast("⬆ Updated quantity");
      }

      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, qty }),
      });
    } catch (e) {
      toast.error("Qty update failed");
      console.error("updateQty error:", e);
    }
  },

  removeFromCart: async (productId) => {
    try {
      set({
        cart: get().cart.filter((p) => p._id !== productId),
      });

      toast("🗑 Removed from cart");

      await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (e) {
      toast.error("Failed to remove from cart");
      console.error("removeFromCart error:", e);
    }
  },

  cartCount: () =>
    get().cart.reduce((total, item) => total + (item.qty || 0), 0),
}));
