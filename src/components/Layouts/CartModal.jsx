"use client";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { animateOpen, animateClose } from "@/lib/animations/drawerAnimations";
import Image from "next/image";

export default function CartModal({ close }) {
  const { cart, fetchCart, updateQty, removeFromCart } = useAppStore();

  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    fetchCart();
    animateOpen(drawerRef, overlayRef);
  }, []);

  const closeModal = () => animateClose(drawerRef, overlayRef, close);

  const total = cart.reduce(
    (sum, item) => sum + item.price.current * item.qty,
    0
  );

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm opacity-0 z-[40]"
        onClick={closeModal}
      ></div>

      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-[90%] sm:w-[420px] bg-[#FAF0E6] z-[50] shadow-xl translate-x-full flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-[#DEB887] bg-white/70">
          <h2 className="text-xl font-bold text-[#654321]">Cart 🛍</h2>
          <button onClick={closeModal} className="hover:rotate-90 transition">
            <X size={22} className="text-[#654321]" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {cart.length === 0 && (
            <p className="text-center text-gray-500 pt-10">
              Your cart is empty 🛒
            </p>
          )}

          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 bg-white p-3 rounded-lg mb-3 shadow hover:scale-[1.02] transition-all"
            >
              <Image
                src={item.imageFront}
                width={70}
                height={90}
                className="rounded-md object-cover"
                alt="item"
              />

              <div className="flex-1">
                <p className="font-semibold text-[#654321] line-clamp-1">
                  {item.name}
                </p>
                <span className="text-[#654321] font-bold">
                  ₹{item.price.current}
                </span>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="p-1 bg-gray-300 rounded-full hover:bg-gray-400 transition"
                    onClick={() => updateQty(item._id, item.qty - 1)}
                  >
                    <Minus size={14} />
                  </button>

                  <span>{item.qty}</span>

                  <button
                    className="p-1 bg-gray-300 rounded-full hover:bg-gray-400 transition"
                    onClick={() => updateQty(item._id, item.qty + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button onClick={() => removeFromCart(item._id)}>
                <Trash2
                  size={20}
                  className="text-red-500 hover:scale-110 transition"
                />
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="sticky bottom-0 p-4 bg-white border-t border-[#DEB887] shadow-md">
            <div className="flex justify-between font-semibold text-[#654321] mb-3">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>

            <button className="w-full py-3 rounded-full bg-[#654321] text-white font-bold hover:bg-[#97714f] transition">
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
