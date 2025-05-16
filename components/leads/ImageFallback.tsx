"use client"

import type React from "react"
import Image from "next/image"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

export default function ImageFallback({
  src,
  alt = "Property photo",
  fallbackSrc = "/placeholder.svg?height=200&width=400",
  className,
  ...props
}: ImageFallbackProps) {
  const [error, setError] = useState(false)

  return (
    <div className="relative w-full h-full">
      <Image
        fill
        src={error ? fallbackSrc : (src as string)}
        alt={alt}
        className={cn("transition-all duration-300", error ? "opacity-70" : "", className)}
        onError={() => setError(true)}
        {...props}
        width={typeof props.width === "number" ? props.width : undefined}
        height={typeof props.height === "number" ? props.height : undefined}
      />
    </div>
  )
}

