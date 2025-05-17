"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  existingImageUrl?: string
  className?: string
}

export default function ImageUpload({ onImageUploaded, existingImageUrl, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("image", file)
      formData.append("folder", "events")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Upload response error:", errorText)
        throw new Error(`Upload failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      onImageUploaded(data.url)

      toast({
        title: "Image uploaded successfully",
      })
    } catch (error) {
      console.error("Upload failed:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageUploaded("")
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      <Label htmlFor="event-image">Event Image</Label>
      <input
        ref={fileInputRef}
        id="event-image"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative mt-2 overflow-hidden rounded-md border border-border">
          <img src={preview || "/placeholder.svg"} alt="Event preview" className="h-64 w-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className="mt-2 flex h-64 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 transition-colors hover:bg-muted/50"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-background p-2 text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium">Click to upload an image</p>
                <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 5MB)</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
