"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  onUploadProgress?: (progress: number) => void
  existingImageUrl?: string
  className?: string
  maxFiles?: number
  acceptedFileTypes?: string[]
  maxFileSize?: number
}

export default function ImageUpload({
  onImageUploaded,
  onUploadProgress,
  existingImageUrl,
  className,
  maxFiles = 5,
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
}: ImageUploadProps) {
  const [image, setImage] = useState<string>(existingImageUrl || "")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size before upload
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `Please upload an image smaller than ${maxFileSize / (1024 * 1024)}MB`,
        variant: "destructive",
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload a valid image file (${acceptedFileTypes.join(", ")})`,
        variant: "destructive",
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("folder", "events")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image")
      }

      setImage(data.url)
      onImageUploaded(data.url)

      toast({
        title: "Image uploaded successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("Image upload failed:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
      setImage("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setImage("")
    onImageUploaded("")
  }

  return (
    <div className={className}>
      <Label htmlFor="event-image">Event Image</Label>
      <input
        ref={fileInputRef}
        id="event-image"
        type="file"
        accept={acceptedFileTypes.join(",")}
        onChange={handleUpload}
        className="hidden"
        disabled={isUploading}
      />

      {image ? (
        <div className="relative mt-2 h-40 w-full overflow-hidden rounded-md border">
          <img src={image || "/placeholder.svg"} alt="Event preview" className="h-full w-full object-cover" />
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
          className="mt-2 flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Click to upload an image</p>
          <p className="text-xs text-muted-foreground">JPEG, PNG, GIF, SVG, WebP (max 5MB)</p>
          {isUploading && (
            <div className="mt-2 flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="text-xs">Uploading...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


