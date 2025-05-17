"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { destinationsApi, ethiopianRegions, destinationCategories, statusOptions } from "@/lib/api-destinations"

// Fallback ImageUpload component (based on NewPackagePage behavior)
const ImageUpload: React.FC<{
  onUploadComplete: (url: string) => void
  label: string
}> = ({ onUploadComplete, label }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Replace with your actual upload service (e.g., Cloudinary, S3)
      const url = URL.createObjectURL(file) // Placeholder
      onUploadComplete(url)
    } catch (error) {
      console.error("Image upload failed:", error)
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <input type="file" ref={inputRef} accept="image/*" onChange={handleUpload} className="hidden" />
      <Button type="button" onClick={() => inputRef.current?.click()}>
        {label}
      </Button>
    </div>
  )
}

// Fallback MultipleImageUpload component (based on NewPackagePage behavior)
const MultipleImageUpload: React.FC<{
  onUploadComplete: (urls: string[]) => void
  label: string
  maxFiles: number
}> = ({ onUploadComplete, label, maxFiles }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const urls: string[] = []
    for (const file of Array.from(files)) {
      try {
        // Replace with your actual upload service
        const url = URL.createObjectURL(file) // Placeholder
        urls.push(url)
      } catch (error) {
        console.error("Image upload failed:", error)
      }
    }
    if (urls.length > 0) {
      onUploadComplete(urls)
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
        disabled={maxFiles <= 0}
      />
      <Button type="button" onClick={() => inputRef.current?.click()}>
        {label}
      </Button>
    </div>
  )
}

export default function NewDestinationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mainImage, setMainImage] = useState<string>("")
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement>(null)

  const [formData, setFormData] = useState<{
    title: string
    description: string
    category: string
    region: string
    city: string
    address: string
    latitude: string
    longitude: string
    featured: boolean
    status: "draft" | "active" | "inactive"
  }>({
    title: "",
    description: "",
    category: "historical",
    region: "addis_ababa",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    featured: false,
    status: "draft",
  })

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSwitchChange = useCallback((name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }, [])

  const handleMainImageUpload = useCallback((url: string) => {
    setMainImage(url)
    toast({
      title: "Main image uploaded",
      variant: "success",
    })
  }, [])

  const handleGalleryImagesUpload = useCallback((urls: string[]) => {
    if (Array.isArray(urls) && urls.length > 0) {
      setGalleryImages((prev) => [...prev, ...urls].slice(0, 10)) // Enforce maxFiles
      toast({
        title: `${urls.length} images added to gallery`,
        variant: "success",
      })
    }
  }, [])

  const handleRemoveGalleryImage = useCallback((index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index))
    toast({
      title: "Image removed from gallery",
      variant: "success",
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.title) throw new Error("Destination title is required")
      if (!formData.description) throw new Error("Destination description is required")
      if (!formData.city) throw new Error("City is required")
      if (!mainImage) throw new Error("Main image is required")

      // Format the data properly for the API
      const destinationData = {
        ...formData,
        images: [mainImage],
        gallery_images: galleryImages,
      }

      console.log("Submitting destination data:", destinationData)

      // Send the data to the API
      await destinationsApi.create(destinationData)

      toast({
        title: "Destination created",
        description: "The destination has been successfully created.",
        variant: "success",
      })

      // Delay navigation to allow toast to be seen
      setTimeout(() => {
        router.push("/destinations")
      }, 1000)
    } catch (error) {
      console.error("Failed to create destination:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create destination. Please try again."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Destination</h1>
        <p className="text-muted-foreground">Create a new travel destination on your platform.</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Location Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of the destination.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Destination Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Lalibela Rock-Hewn Churches"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed description of the destination"
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured Destination</Label>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Featured destinations are highlighted on the homepage.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>Provide location information for the destination.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="region">
                    Region <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => handleSelectChange("region", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {ethiopianRegions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Lalibela"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Lalibela, Amhara Region, Ethiopia"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Coordinates (Latitude, Longitude)</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="Latitude (e.g. 12.0333)"
                    />
                    <Input
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="Longitude (e.g. 39.0333)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Upload images for this destination.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Main Image <span className="text-destructive">*</span>
                  </h3>
                  {mainImage ? (
                    <div className="relative h-40 w-full overflow-hidden rounded-md border">
                      <img
                        src={mainImage || "/placeholder.svg"}
                        alt="Main destination image"
                        className="h-full w-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full"
                        onClick={() => setMainImage("")}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <ImageUpload onUploadComplete={handleMainImageUpload} label="Upload Main Image" />
                  )}
                  <p className="text-xs text-muted-foreground">
                    This will be the primary image displayed for the destination.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Gallery Images</h3>
                    <span className="text-sm text-muted-foreground">{galleryImages.length}/10 images</span>
                  </div>

                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {galleryImages.map((image, index) => (
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
                            onClick={() => handleRemoveGalleryImage(index)}
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <MultipleImageUpload
                      onUploadComplete={handleGalleryImagesUpload}
                      label="Upload Gallery Images"
                      maxFiles={10 - galleryImages.length}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add up to 10 images to showcase different aspects of the destination.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/destinations">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </span>
              ) : (
                "Save Destination"
              )}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
