"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function AppInitializer() {
  const { fetchCart, fetchWishlist } = useAppStore();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth="))
      ?.split("=")[1];

    if (token) {
      fetchCart();
      fetchWishlist();
    }
  }, []);

  return null;
}
