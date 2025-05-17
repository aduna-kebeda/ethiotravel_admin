"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Function to upload image to Cloudinary
async function uploadToCloudinary(file: File) {
  try {
    // Create form data
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "ethiopian_travel") // Replace with your upload preset

    // Upload to Cloudinary
    const response = await fetch("https://api.cloudinary.com/v1_1/your-cloud-name/image/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw error
  }
}

// Single image upload component
export const ImageUpload: React.FC<{
  onUploadComplete: (url: string) => void
  label: string
  initialImage?: string
}> = ({ onUploadComplete, label, initialImage }) => {
  const { toast } = useToast()
  const [image, setImage] = useState<string>(initialImage || "")
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // For now, use a placeholder URL for testing
      // In production, replace this with actual Cloudinary upload
      const url = URL.createObjectURL(file)
      // const url = await uploadToCloudinary(file)

      setImage(url)
      onUploadComplete(url)

      toast({
        title: "Image uploaded",
        description: "Remember to save your changes to apply this image.",
        variant: "success",
      })
    } catch (error) {
      console.error("Image upload failed:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setImage("")
    onUploadComplete("")
  }

  return (
    <div className="space-y-2">
      {image ? (
        <div className="relative h-40 w-full overflow-hidden rounded-md border">
          <img src={image || "/placeholder.svg"} alt="Uploaded image" className="h-full w-full object-cover" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 2MB)</p>
          {isUploading && (
            <div className="mt-2 flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="text-xs">Uploading...</span>
            </div>
          )}
        </div>
      )}
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  )
}

// Multiple image upload component
export const MultipleImageUpload: React.FC<{
  onUploadComplete: (urls: string[]) => void
  label: string
  maxFiles: number
  initialImages?: string[]
}> = ({ onUploadComplete, label, maxFiles, initialImages = [] }) => {
  const { toast } = useToast()
  const [images, setImages] = useState<string[]>(initialImages || [])
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const newUrls: string[] = []

      // Process each file
      for (let i = 0; i < Math.min(files.length, maxFiles - images.length); i++) {
        const file = files[i]

        // For now, use a placeholder URL for testing
        // In production, replace this with actual Cloudinary upload
        const url = URL.createObjectURL(file)
        // const url = await uploadToCloudinary(file)

        newUrls.push(url)
      }

      const updatedImages = [...images, ...newUrls]
      setImages(updatedImages)
      onUploadComplete(updatedImages)

      toast({
        title: `${newUrls.length} image(s) uploaded`,
        description: "Remember to save your changes to apply these images.",
        variant: "success",
      })
    } catch (error) {
      console.error("Image upload failed:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the input to allow uploading the same file again
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  const handleRemove = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onUploadComplete(updatedImages)
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
              <img
                src={image || "/placeholder.svg"}
                alt={`Gallery ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-5 w-5 rounded-full"
                onClick={() => handleRemove(index)}
                type="button"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxFiles && (
        <div
          className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            {images.length}/{maxFiles} images
          </p>
          {isUploading && (
            <div className="mt-2 flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="text-xs">Uploading...</span>
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
        disabled={isUploading || images.length >= maxFiles}
      />
    </div>
  )
}
