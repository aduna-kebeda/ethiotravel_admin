"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, CheckCircle } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset states
    setUploadComplete(false)
    setUploadProgress(0)

    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload a valid image file (${acceptedFileTypes.join(", ")})`,
        variant: "destructive",
      })
      return
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `Please upload an image smaller than ${maxFileSize / (1024 * 1024)}MB`,
        variant: "destructive",
      })
      return
    }

    // Show preview immediately
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

      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/upload", true)

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total)
          setUploadProgress(progress)
          onUploadProgress?.(progress)
          console.log('Upload progress:', progress) // Add this for debugging
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText)
            console.log('Upload response:', data) // Add this for debugging
            setUploadProgress(100)
            setUploadComplete(true)
            onImageUploaded(data.url)
            
            toast({
              title: "Success",
              description: "Image uploaded successfully",
            })
            
            // Clear uploading state after a short delay to show completion
            setTimeout(() => {
              setIsUploading(false)
            }, 1000)
          } catch (error) {
            console.error("Failed to parse response:", error)
            throw new Error("Invalid server response")
          }
        } else {
          throw new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`)
        }
      }

      xhr.onerror = () => {
        throw new Error("Network error occurred during upload")
      }

      xhr.send(formData)
    } catch (error) {
      console.error("Upload failed:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your image. Please try again.",
        variant: "destructive",
      })
      setPreview(null)
      setUploadProgress(0)
      setUploadComplete(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    setUploadProgress(0)
    setUploadComplete(false)
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
        accept={acceptedFileTypes.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative mt-2 overflow-hidden rounded-md border border-border">
          <img src={preview || "/placeholder.svg"} alt="Event preview" className="h-64 w-full object-cover" />
          
          {/* Upload Progress Overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="flex flex-col items-center gap-3 text-white">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                <div className="text-center">
                  <p className="text-sm font-medium">Uploading to Cloudinary...</p>
                  <p className="text-2xl font-bold">{uploadProgress}%</p>
                </div>
                <div className="w-48">
                  <Progress value={uploadProgress} className="bg-white/20 h-3" />
                </div>
              </div>
            </div>
          )}

          {/* Success Indicator */}
          {uploadComplete && !isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/80">
              <div className="flex flex-col items-center gap-2 text-white">
                <CheckCircle className="h-16 w-16" />
                <p className="text-lg font-semibold">Upload Complete!</p>
              </div>
            </div>
          )}

          {/* Remove Button */}
          {!isUploading && !uploadComplete && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className="mt-2 flex h-64 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 transition-colors hover:bg-muted/50"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-background p-2 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Click to upload an image</p>
              <p className="text-xs text-muted-foreground">
                {acceptedFileTypes.join(", ")} (max. {maxFileSize / (1024 * 1024)}MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar Below Image (when uploading) */}
      {isUploading && preview && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading to Cloudinary...</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  )
}