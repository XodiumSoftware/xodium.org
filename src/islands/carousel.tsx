/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {useEffect, useState} from "preact/hooks";

interface CarouselProps {
  images: string[];
  interval?: number;
}

export default function Carousel({ images, interval = 5 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval * 1000);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  function handlePrev() {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }

  return (
    <div class="relative w-full overflow-hidden max-h-screen">
      {/* Label */}
      <h2 class="absolute text-3xl sm:text-4xl font-bold tracking-tight bg-slate-100 dark:bg-slate-900 text-black dark:text-white p-3 rounded-br-lg z-10">
        Projects
      </h2>
      {/* Image Slides */}
      <div
        class="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index + 1}`}
            class="w-full flex-shrink-0 object-cover"
          />
        ))}
      </div>
      {/* Navigation Buttons */}
      <button
        type="button"
        onClick={handlePrev}
        class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-slate-100 dark:bg-slate-900 bg-opacity-50 text-black dark:text-white w-10 h-10 rounded-full hover:text-[#CB2D3E] hover:outline hover:outline-2 hover:outline-[#CB2D3E]"
      >
        ❮
      </button>
      <button
        type="button"
        onClick={handleNext}
        class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-slate-100 dark:bg-slate-900 bg-opacity-50 text-black dark:text-white w-10 h-10 rounded-full hover:text-[#CB2D3E] hover:outline hover:outline-2 hover:outline-[#CB2D3E]"
      >
        ❯
      </button>
      {/* Indicator Dots */}
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            class={`w-3 h-3 rounded-full hover:bg-[#CB2D3E] ${
              currentIndex === index ? "bg-gray-800" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
