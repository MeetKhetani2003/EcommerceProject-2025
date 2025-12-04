"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  ChevronDown,
  Check,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import toast from "react-hot-toast";
import { useAppStore } from "@/store/useAppStore";
import CartModal from "../Layouts/CartModal";

const PALETTE = {
  BACKGROUND: "bg-[#fff9f4]",
  BORDER: "border-[#deb887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321]",
  HOVER: "hover:bg-[#deb887]",
};

export default function ProductDetailsClient({ product }) {
  const { wishlist, addToWishlist, removeFromWishlist, addToCart } =
    useAppStore();
  const isWishlisted = wishlist.some((w) => w._id === product._id);
  const [cartOpen, setCartOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [pincode, setPincode] = useState("");

  // Merge front/back + gallery without duplication
  const gallery = useMemo(() => {
    const extra = product.gallery?.map((g) => `/api/images/${g.fileId}`) ?? [];
    return [product.imageFront, ...extra].filter(Boolean);
  }, [product]);

  const toggleWishlist = () => {
    if (isWishlisted) removeFromWishlist(product._id);
    else addToWishlist(product);
  };

  return (
    <div className={`max-w-[1400px] mx-auto px-4 py-10 ${PALETTE.BACKGROUND}`}>
      {/* Breadcrumb */}
      <p className={`text-xs opacity-60 mb-4 ${PALETTE.TEXT}`}>
        Home / {product.category} /
        <span className="opacity-90"> {product.name}</span>
      </p>

      {/* Grid */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-10">
        {/* Desktop: 2-column Grid */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          {gallery.map((img, i) => (
            <div
              key={i}
              className="relative w-full h-[650px] rounded-lg overflow-hidden bg-[#ebdfd6]"
            >
              <Image
                src={img}
                fill
                alt={product.name}
                className="object-cover hover:scale-105 duration-500"
              />
            </div>
          ))}
        </div>

        {/* Mobile Swiper */}
        <div className="md:hidden">
          <Swiper>
            {gallery.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="relative w-full h-[450px] rounded-xl bg-[#ead9c9]">
                  <Image
                    src={img}
                    fill
                    alt={product.name}
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Tablet Swiper */}
        <div className="hidden md:block lg:hidden mb-6">
          <Swiper>
            {gallery.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="relative w-full h-[950px] rounded-xl bg-[#ead9c9]">
                  <Image
                    src={img}
                    fill
                    alt={product.name}
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Right Side Content */}
        <div className="lg:sticky lg:top-10 space-y-6">
          {/* Labels */}
          <div className="space-y-1">
            {product.isNewArrival && (
              <span className="text-xs px-2 py-1 rounded bg-[#deb88733] border border-[#deb887] text-[#654321]">
                ✨ New Arrival
              </span>
            )}
            {product.isBestseller && (
              <span className="block text-xs px-2 py-1 rounded border border-[#deb887] text-[#654321]">
                ⭐ Bestseller
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            className={`text-3xl font-semibold tracking-tight ${PALETTE.TEXT}`}
          >
            {product.name}
          </h1>
          <p className={`uppercase text-xs opacity-60 ${PALETTE.TEXT}`}>
            {product.theme} • {product.category}
          </p>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {product.badges?.map((b, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 border ${PALETTE.BORDER} rounded-full ${PALETTE.TEXT}`}
              >
                {b}
              </span>
            ))}
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={toggleWishlist}
            className={`p-2 border rounded-md transition ${PALETTE.BORDER} ${PALETTE.TEXT} hover:bg-[#deb887]`}
          >
            <Heart className={`${isWishlisted ? "fill-[#654321]" : ""}`} />
          </button>

          {/* Price */}
          <div className={`border-y py-4 ${PALETTE.BORDER}`}>
            <div className="flex items-center gap-3">
              <p className={`text-3xl font-bold ${PALETTE.TEXT}`}>
                ₹{product.price.current}
              </p>
              {product.price.old && (
                <p className="line-through opacity-50">₹{product.price.old}</p>
              )}
              <span className="text-sm text-green-700">
                {product.price.discountText}
              </span>
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <p className={`text-xs mb-2 uppercase ${PALETTE.TEXT}`}>
              Select Size
            </p>
            <div className="flex gap-2 flex-wrap">
              {product.availableSizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-5 py-2 text-sm rounded-md border transition 
                    ${
                      selectedSize === size
                        ? `${PALETTE.ACCENT} text-white`
                        : `${PALETTE.BORDER} ${PALETTE.TEXT} hover:bg-[#deb887]`
                    } `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* ATC */}
          <div className="space-y-3">
            {!added ? (
              // BEFORE ITEM ADDED
              <button
                onClick={() => {
                  if (!selectedSize) return toast.error("Select a size first");
                  addToCart({ ...product, selectedSize });
                  setAdded(true); // switch UI
                  // setCartOpen(true); // open modal instantly
                }}
                className={`${PALETTE.ACCENT} w-full py-3 rounded-md text-white flex items-center justify-center gap-2 font-semibold tracking-wide ${PALETTE.HOVER}`}
              >
                <ShoppingBag className="w-5 h-5" />
                Add To Bag
              </button>
            ) : (
              <>
                {/* AFTER ITEM ADDED */}
                <button
                  onClick={() => setCartOpen(true)}
                  className={`w-full py-3 border ${PALETTE.BORDER} rounded-md flex items-center justify-center gap-2 font-semibold ${PALETTE.TEXT} hover:bg-[#deb88740]`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Go To Cart
                </button>
              </>
            )}
          </div>

          {/* Pincode
          <div className="space-y-2">
            <p className={`text-xs ${PALETTE.TEXT}`}>Delivery Check</p>
            <div className="flex gap-2">
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter pincode"
                className={`border px-3 py-2 rounded-md w-full ${PALETTE.BORDER} ${PALETTE.TEXT}`}
              />
              <button
                className={`px-5 py-2 rounded-md text-white ${PALETTE.ACCENT} ${PALETTE.HOVER}`}
              >
                CHECK
              </button>
            </div>
          </div> */}

          {/* Accordions */}
          <div className={`border-t pt-6 space-y-5 ${PALETTE.BORDER}`}>
            {[
              {
                key: "details",
                title: "Product Description",
                content: product.description,
              },
              {
                key: "specs",
                title: "Specifications",
                content: product.specifications,
              },
              {
                key: "fabric",
                title: "Fabric & Material",
                content: product.material,
              },
              {
                key: "care",
                title: "Wash & Care Guide",
                content: product.careInstructions,
              },
            ].map((section) => (
              <div key={section.key} className="border-b pb-4 last:border-b-0">
                {/* Accordion Trigger */}
                <button
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === section.key ? null : section.key
                    )
                  }
                  className={`flex justify-between items-center w-full py-2 text-base font-semibold ${PALETTE.TEXT} tracking-wide`}
                >
                  {section.title}
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      openAccordion === section.key ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Accordion Content */}
                {openAccordion === section.key && (
                  <div className="mt-3 text-sm leading-relaxed pl-1">
                    {/* SPECIFICATION TABLE */}
                    {section.key === "specs" &&
                    Array.isArray(section.content) ? (
                      <table className="w-full text-sm border-collapse">
                        <tbody>
                          {section.content.map((row, i) => (
                            <tr
                              key={i}
                              className={`border-b ${PALETTE.BORDER} last:border-b-0`}
                            >
                              <td
                                className={`py-3 pr-4 font-medium ${PALETTE.TEXT} opacity-90`}
                              >
                                {row.key}
                              </td>
                              <td
                                className={`py-3 pl-4 ${PALETTE.TEXT} opacity-75`}
                              >
                                {row.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className={`${PALETTE.TEXT} opacity-80 text-[15px]`}>
                        {section.content}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {cartOpen && <CartModal close={() => setCartOpen(false)} />}
    </div>
  );
}
