"use client";
import { useAppStore } from "@/store/useAppStore";
import Image from "next/image";
import SideModal from "./SideModal";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";

export default function CartModal({ open, onClose }) {
  const cart = useAppStore((s) => s.cart);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const updateQty = useAppStore((s) => s.updateQty);

  const total = cart.reduce(
    (sum, item) => sum + item.qty * item.price.current,
    0
  );

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Your Cart"
      icon={<ShoppingBag size={20} className="text-[#4E342E]" />}
    >
      {cart.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-6">
          🛍 Cart is empty.
        </p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 items-center py-3 border-b border-[#DEB887]"
            >
              <Image
                src={item.imageFront || "/placeholder.png"}
                width={70}
                height={90}
                className="object-cover rounded-md"
                alt=""
              />

              <div className="flex-1">
                <h3 className="font-semibold text-[#4E342E] text-sm">
                  {item.name}
                </h3>
                <p className="font-bold mt-1">₹{item.price.current}</p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="p-1 bg-gray-300 rounded-md"
                    onClick={() => updateQty(item._id, item.qty - 1)}
                  >
                    <Minus size={16} />
                  </button>

                  <span className="font-semibold">{item.qty}</span>

                  <button
                    className="p-1 bg-gray-300 rounded-md"
                    onClick={() => updateQty(item._id, item.qty + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 mt-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Checkout */}
          <div className="mt-6 p-4 border-t border-[#DEB887]">
            <p className="font-bold text-lg mb-3 text-[#4E342E]">
              Total: ₹{total}
            </p>
            <button className="w-full bg-[#654321] text-white py-3 rounded-lg hover:bg-[#4E342E] transition">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </SideModal>
  );
}
