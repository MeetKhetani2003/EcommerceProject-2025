"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";
import SizeSelectModalWhishlist from "@/components/Layouts/SelectSizeModalWhishlist";
import { useCartStore } from "@/store/useCartStore";

const PALETTE = {
  BG: "bg-[#fff9f4]",
  CARD: "bg-white",
  BORDER: "border-[#deb887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321] text-white",
};

export default function WishlistPage() {
  const { wishlist, fetchWishlist, removeFromWishlist } = useAppStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className={`min-h-screen ${PALETTE.BG}`}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="text-red-500" />
          <h1 className={`text-2xl font-bold ${PALETTE.TEXT}`}>My Wishlist</h1>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart size={60} className="text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">Your wishlist is empty</p>
            <Link
              href="/products"
              className="mt-4 px-6 py-2 rounded-md bg-[#654321] text-white"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item._id}
                className={`${PALETTE.CARD} rounded-lg shadow-sm hover:shadow-md transition overflow-hidden`}
              >
                {/* Image */}
                <Link href={`/products/${item._id}`}>
                  <div className="relative w-full h-[260px] bg-[#f2e8dc]">
                    {item.imageFront ? (
                      <Image
                        src={item.imageFront}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <p
                    className={`text-sm font-semibold ${PALETTE.TEXT} line-clamp-1`}
                  >
                    {item.name}
                  </p>

                  <p className="mt-1 font-bold text-[#654321]">
                    ₹{item.price?.current}
                  </p>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (item.availableSizes?.length > 1) {
                          setSelectedProduct(item);
                          setSizeModalOpen(true);
                        } else {
                          addToCart({
                            ...item,
                            selectedSize: item.availableSizes?.[0],
                          });
                          toast.success("Added to cart 🛒");
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-[#654321] text-white hover:bg-[#8c6239]"
                    >
                      <ShoppingCart size={14} />
                      Cart
                    </button>

                    <button
                      onClick={() => {
                        removeFromWishlist(item._id);
                        toast.success("Removed from wishlist");
                      }}
                      className="text-red-500 hover:scale-110 transition"
                      aria-label="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {sizeModalOpen && selectedProduct && (
        <SizeSelectModalWhishlist
          product={selectedProduct}
          onClose={() => {
            setSizeModalOpen(false);
            setSelectedProduct(null);
          }}
          onSelect={(size) => {
            addToCart({
              ...selectedProduct,
              selectedSize: size,
            });
            // toast.success(`Added to cart (${size}) 🛒`);
            setSizeModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
