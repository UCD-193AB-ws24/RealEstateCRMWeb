"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import ImageFallback from "./ImageFallback"

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
}

export default function ImageCarousel({ images, alt, className }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Return regular image if only one image exists
  if (!images || images.length === 0) {
    return null
  }

  if (images.length === 1) {
    return (
      <div className={cn("relative aspect-[4/3] w-full overflow-hidden bg-gray-100", className)}>
        <ImageFallback
          src={images[0] || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden group bg-gray-100", className)}>
      {/* Current image */}
      <ImageFallback
        src={images[currentIndex] || "/placeholder.svg"}
        alt={`${alt} - Image ${currentIndex + 1} of ${images.length}`}
        className="w-full h-full object-cover transition-transform duration-500"
        loading="lazy"
      />

      {/* Navigation buttons - only visible on hover or when focused */}
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Image counter */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              currentIndex === index ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80",
            )}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

