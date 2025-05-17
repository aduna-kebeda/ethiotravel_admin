"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  label?: string
  className?: string
  accept?: string
}

export function ImageUpload({
  onUploadComplete,
  label = "Upload Image",
  className = "",
  accept = "image/*",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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
      formData.append("folder", "ethiopian-travel")

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

      // Ensure we have a valid URL before calling onUploadComplete
      if (data && data.url) {
        onUploadComplete(data.url)

        toast({
          title: "Image uploaded successfully",
          variant: "success",
        })
      } else {
        throw new Error("Invalid response from server: missing image URL")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      })
      // Clear preview on error
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={accept} />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex h-32 cursor-pointer items-center justify-center rounded-md border border-dashed hover:border-primary/50"
        >
          <div className="flex flex-col items-center gap-1 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm font-medium">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 2MB)</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative h-32 w-full overflow-hidden rounded-md border">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6 rounded-full"
            onClick={handleClearImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

interface MultipleImageUploadProps {
  onUploadComplete: (urls: string[]) => void
  label?: string
  className?: string
  accept?: string
  maxFiles?: number
}

export function MultipleImageUpload({
  onUploadComplete,
  label = "Upload Images",
  className = "",
  accept = "image/*",
  maxFiles = 10,
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (files.length > maxFiles) {
      toast({
        title: `Maximum ${maxFiles} images allowed`,
        description: `Please select up to ${maxFiles} images.`,
        variant: "destructive",
      })
      return
    }

    // Show previews
    const fileArray = Array.from(files)
    const previewUrls: string[] = []

    for (const file of fileArray) {
      const reader = new FileReader()
      await new Promise<void>((resolve) => {
        reader.onload = () => {
          previewUrls.push(reader.result as string)
          resolve()
        }
        reader.readAsDataURL(file)
      })
    }

    setPreviews(previewUrls)

    // Upload to server
    try {
      setIsUploading(true)
      const uploadedUrls: string[] = []

      // Upload each file individually to avoid potential issues with multiple file uploads
      for (const file of fileArray) {
        const formData = new FormData()
        formData.append("image", file)
        formData.append("folder", "ethiopian-travel")

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
        if (data && data.url) {
          uploadedUrls.push(data.url)
        } else {
          console.error("Invalid response from server:", data)
        }
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls)

        toast({
          title: `${uploadedUrls.length} images uploaded successfully`,
          variant: "success",
        })

        // Clear the file input and previews after successful upload
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        setPreviews([])
      } else {
        throw new Error("No images were successfully uploaded")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your images. Please try again.",
        variant: "destructive",
      })
      // Clear previews on error
      setPreviews([])
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearImages = () => {
    setPreviews([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={accept} multiple />

      {previews.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex h-32 cursor-pointer items-center justify-center rounded-md border border-dashed hover:border-primary/50"
        >
          <div className="flex flex-col items-center gap-1 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm font-medium">Uploading {previews.length} images...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">Select multiple images (max. {maxFiles})</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative h-20 w-20 overflow-hidden rounded-md border">
                <img
                  src={preview || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleClearImages} disabled={isUploading}>
              Clear
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click()
                }
              }}
              disabled={isUploading}
            >
              Add More
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
