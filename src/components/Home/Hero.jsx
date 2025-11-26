"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Hero = ({ slides = [] }) => {
  // If no slides passed, show nothing (avoids empty, confusing block)
  if (!slides.length) return null;

  return (
    <div className="w-full mt-6">
      {/* Big centered container like Souled Store */}
      <div className="max-w-[1400px] mx-auto px-4">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          navigation={true}
          pagination={{ clickable: true }}
          speed={650}
          className="hero-swiper"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div
                className="
                  w-full
                  h-[260px]       /* mobile */
                  sm:h-[320px]
                  md:h-[380px]
                  lg:h-[440px]
                  xl:h-[480px]    /* large desktop - big nice banner */
                  rounded-lg
                  overflow-hidden
                  bg-[#f5f5f5]
                  relative
                "
              >
                {/* IMAGE */}
                {slide.type === "image" && (
                  <img
                    src={slide.url}
                    alt={slide.alt || `banner-${i}`}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* VIDEO */}
                {slide.type === "video" && (
                  <video
                    src={slide.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Hero;
