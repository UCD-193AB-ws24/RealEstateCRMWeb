"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

export default function ImageFallback({
  src,
  alt,
  fallbackSrc = "/placeholder.svg?height=200&width=400",
  className,
  ...props
}: ImageFallbackProps) {
  const [error, setError] = useState(false)

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      className={cn("transition-all duration-300", error ? "opacity-70" : "", className)}
      onError={() => setError(true)}
      {...props}
    />
  )
}

