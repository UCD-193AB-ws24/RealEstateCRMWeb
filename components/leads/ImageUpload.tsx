"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, X } from "lucide-react"

interface ImageUploadProps {
  onUploadAction: (urls: string[]) => void
}

export default function ImageUpload({ onUploadAction }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    for (let i = 0; i < files.length && i < 10; i++) {
      const file = files[i]
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        newImages.push(reader.result as string)
        // if (newImages.length === Math.min(files.length, 10)) {
          const updatedImages = [...images, ...newImages]
          setImages(updatedImages)
          onUploadAction(updatedImages)
        // }
      }
      
    }
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onUploadAction(updatedImages)
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative group aspect-square">
          <Image
            fill
            src={image}
            alt={`Lead image ${index + 1}`}
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => handleRemoveImage(index)}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      {images.length < 10 && (
        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <Plus className="h-6 w-6 text-gray-400" />
        </label>
      )}
    </div>
  )
} 