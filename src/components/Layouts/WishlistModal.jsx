"use client";
import { useAppStore } from "@/store/useAppStore";
import Image from "next/image";
import SideModal from "./SideModal";
import { Heart, Trash2, ShoppingCart } from "lucide-react";

export default function WishlistModal({ open, onClose }) {
  const wishlist = useAppStore((s) => s.wishlist);
  const removeFromWishlist = useAppStore((s) => s.removeFromWishlist);
  const addToCart = useAppStore((s) => s.addToCart);

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Your Wishlist"
      icon={<Heart className="text-red-500" size={20} />}
    >
      {wishlist.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-6">
          🫶 Nothing saved yet.
        </p>
      ) : (
        wishlist.map((item) => (
          <div
            key={item._id}
            className="flex gap-4 items-center py-3 border-b border-[#DEB887]"
          >
            <Image
              src={item.imageFront || "/placeholder.png"}
              width={65}
              height={80}
              alt=""
              className="rounded-md object-cover"
            />

            <div className="flex flex-col flex-1">
              <h3 className="font-semibold text-[#4E342E] text-sm">
                {item.name}
              </h3>
              <p className="text-xs text-gray-500">{item.category}</p>
              <p className="mt-1 font-semibold text-[#4E342E]">
                ₹{item.price.current}
              </p>

              <div className="flex gap-3 mt-2">
                <button
                  className="flex items-center gap-1 text-sm bg-[#654321] text-white px-3 py-1 rounded-md"
                  onClick={() => addToCart(item)}
                >
                  <ShoppingCart size={16} /> Add
                </button>

                <button
                  onClick={() => removeFromWishlist(item._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </SideModal>
  );
}
