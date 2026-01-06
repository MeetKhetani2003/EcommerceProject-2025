"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import SelectSizeModal from "./SelectSizeModal";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";

export default function ProductCard({ product }) {
  if (!product) return null;

  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  /* ---------- USER AUTH ---------- */
  const { user } = useUserStore();

  const isLoggedIn = user?._id ? true : false;

  const requireLogin = () => {
    toast.error("Login first to continue 🔐");
    router.push("/auth");
  };

  /* ---------- WISHLIST ---------- */
  const wishlist = useAppStore((s) => s.wishlist);
  const addWishlist = useAppStore((s) => s.addToWishlist);
  const removeWishlist = useAppStore((s) => s.removeFromWishlist);
  const isWishlisted = wishlist.some((i) => i._id === product._id);

  /* ---------- CART ---------- */
  const addToCart = useCartStore((s) => s.addToCart);

  return (
    <>
      <div
        className="bg-[#FAF0E6] rounded-2xl shadow-md border border-[#DEB887]
        transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer"
        onClick={() => router.push(`/products/${product._id}`)}
      >
        <div
          className="relative h-80 w-full"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {product.imageFrontFileId && (
            <Image
              src={`/api/images/${product.imageFrontFileId}`}
              alt={product.name}
              fill
              className={`object-cover transition ${
                hover ? "opacity-0" : "opacity-100"
              }`}
            />
          )}

          {product.imageBackFileId && (
            <Image
              src={`/api/images/${product.imageBackFileId}`}
              alt="back"
              fill
              className={`object-cover transition ${
                hover ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* ❤️ WISHLIST */}
          <button
            onClick={(e) => {
              e.stopPropagation();

              if (!isLoggedIn) {
                requireLogin();
                return;
              }

              isWishlisted ? removeWishlist(product._id) : addWishlist(product);
            }}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md z-20"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg truncate text-[#654321]">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xl font-bold text-[#654321]">
              ₹{product.price.current}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();

                if (!isLoggedIn) {
                  requireLogin();
                  return;
                }

                // ✅ Accessories → direct add
                if (product.mainCategory === "accessories") {
                  addToCart({ ...product, selectedSize: "General" });
                  return;
                }

                setShowSizeModal(true);
              }}
              className="px-4 py-2 rounded-full bg-[#654321] text-white text-sm"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* SIZE MODAL */}
      {showSizeModal && (
        <SelectSizeModal
          mainCategory={product.mainCategory}
          sizes={product.sizes}
          close={() => setShowSizeModal(false)}
          onSelect={(size) => {
            addToCart({ ...product, selectedSize: size });
            setShowSizeModal(false);
          }}
        />
      )}
    </>
  );
}
