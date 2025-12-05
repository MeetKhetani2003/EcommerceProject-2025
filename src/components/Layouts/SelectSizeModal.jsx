"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const PALETTE = {
  BG: "bg-[#fff9f4]",
  BORDER: "border-[#deb887]",
  ACCENT: "bg-[#654321]",
  HOVER: "hover:bg-[#8c6239]",
  TEXT: "text-[#654321]",
};

export default function SelectSizeModal({ sizes, onSelect, close }) {
  const [selected, setSelected] = useState(null);

  // ESC key to close
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Full Screen Backdrop */}
      <div
        onClick={close}
        className="fixed inset-0 bg-black/40 backdrop-blur-[3px] z-[100]"
      ></div>

      {/* REAL CENTER MODAL */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        ${PALETTE.BG} w-[90%] max-w-[340px] p-6 rounded-xl border shadow-2xl 
        z-[101] scale-100 animate-fadeIn`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold text-lg ${PALETTE.TEXT}`}>Select Size</h2>
          <button onClick={close} className="hover:rotate-90 transition">
            <X className={`${PALETTE.TEXT}`} />
          </button>
        </div>

        {/* Size Buttons */}
        <div className="flex gap-3 flex-wrap mb-6">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={`px-4 py-2 rounded-lg border font-semibold transition-all duration-200 ${
                selected === s
                  ? `${PALETTE.ACCENT} text-white shadow-md scale-[1.08]`
                  : `${PALETTE.BORDER} ${PALETTE.TEXT} hover:bg-[#f3e3d2]`
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className={`w-full py-3 rounded-lg text-white font-bold transition ${
            selected
              ? `${PALETTE.ACCENT} ${PALETTE.HOVER}`
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Confirm Size
        </button>
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-fadeIn {
          animation: pop 0.25s ease-out;
        }
        @keyframes pop {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
