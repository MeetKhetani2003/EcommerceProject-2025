"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ---------------- WISHLIST ----------------
      wishlist: [],

      addToWishlist: (product) => {
        const exists = get().wishlist.some((item) => item._id === product._id);
        if (!exists) {
          set({ wishlist: [...get().wishlist, product] });
        }
      },

      removeFromWishlist: (id) => {
        set({ wishlist: get().wishlist.filter((item) => item._id !== id) });
      },

      isInWishlist: (id) => get().wishlist.some((item) => item._id === id),

      // ---------------- CART ----------------
      cart: [],

      addToCart: (product) => {
        const cart = get().cart;
        const exists = cart.find((item) => item._id === product._id);

        if (exists) {
          exists.qty += 1;
          set({ cart: [...cart] });
        } else {
          set({ cart: [...cart, { ...product, qty: 1 }] });
        }
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item._id !== id) });
      },

      updateQty: (id, qty) => {
        if (qty < 1) return;
        const cart = get().cart.map((item) =>
          item._id === id ? { ...item, qty } : item
        );
        set({ cart });
      },

      cartCount: () => get().cart.reduce((total, item) => total + item.qty, 0),

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "ecommerce-app", // localStorage key
    }
  )
);
