"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  onUploadAction: (urls: string[]) => void
  initialImages?: string[]
}

const MAX_IMAGE_SIZE = 512 * 1024; // 512KB

export default function ImageUpload({ onUploadAction, initialImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)

  // Function to resize an image
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const aspectRatio = width / height;
          
          // Start with a reasonable size
          let maxDimension = 1200;
          
          // Gradually reduce size until we're under the limit
          let quality = 0.9;
          let dataUrl: string;
          
          const tryResize = () => {
            if (width > height) {
              width = maxDimension;
              height = width / aspectRatio;
            } else {
              height = maxDimension;
              width = height * aspectRatio;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Check size by converting base64 to blob
            const base64Data = dataUrl.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteSize = byteCharacters.length;
            
            if (byteSize > MAX_IMAGE_SIZE && maxDimension > 400) {
              // Try again with smaller dimensions or lower quality
              if (maxDimension > 800) {
                maxDimension -= 200;
              } else {
                maxDimension -= 100;
              }
              tryResize();
            } else if (byteSize > MAX_IMAGE_SIZE) {
              // If we're already at minimum dimensions, reduce quality
              quality -= 0.1;
              if (quality >= 0.5) {
                tryResize();
              } else {
                // We couldn't reduce it enough
                toast.error(`Could not reduce image to under 512KB.`);
                reject(new Error('Image too large'));
              }
            } else {
              // We're good, return the result
              resolve(dataUrl);
            }
          };
          
          tryResize();
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // toast.info(`Processing ${files.length} image(s)...`);
    
    const newImages: string[] = [];
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < files.length && images.length + newImages.length < 10; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > MAX_IMAGE_SIZE) {
        // toast.info(`Resizing ${file.name} to fit 512KB limit...`);
        
        const promise = resizeImage(file)
          .then(resizedImage => {
            newImages.push(resizedImage);
          })
          .catch(error => {
            console.error("Error resizing image:", error);
            toast.error(`Failed to process ${file.name}`);
          });
        
        promises.push(promise);
      } else {
        // File is already small enough
        const promise = new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            newImages.push(reader.result as string);
            resolve();
          };
          reader.onerror = () => {
            toast.error(`Failed to read ${file.name}`);
            resolve();
          };
        });
        
        promises.push(promise);
      }
    }
    
    // Wait for all images to process
    try {
      await Promise.all(promises);
      
      if (newImages.length === 0) {
        return;
      }
      
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onUploadAction(updatedImages);
      
      
      
      if (files.length > 10 - images.length) {
        toast.warning(`Only added ${Math.min(files.length, 10 - images.length)} image(s). Maximum 10 images allowed.`);
      }
      else if(newImages.length > 0) {
        toast.success(`${newImages.length} image(s) added successfully`);
      }
      
    } catch (error) {
      console.error("Error processing images:", error);
      toast.error("Some images could not be processed");
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onUploadAction(updatedImages);
  };

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
          <div className="flex flex-col items-center">
            <Plus className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1 text-center">Max 512KB</span>
          </div>
        </label>
      )}
    </div>
  );
} 