"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { use } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload, MultipleImageUpload } from "@/components/destinations/image-upload"
import {
  destinationsApi,
  ethiopianRegions,
  destinationCategories,
  statusOptions,
  formatDestinationData,
  type Destination,
} from "@/lib/api-destinations"
import { Trash2 } from "lucide-react"

export default function EditDestinationPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [destination, setDestination] = useState<Destination | null>(null)
  const [mainImage, setMainImage] = useState<string>("")
  const [galleryImages, setGalleryImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const data = await destinationsApi.getById(params.id)
        setDestination(data)

        // Set form data
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "historical",
          region: data.region || "addis_ababa",
          city: data.city || "",
          address: data.address || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          featured: data.featured || false,
          status: data.status || "draft",
        })

        // Set images
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0])
        }

        if (data.gallery_images && data.gallery_images.length > 0) {
          setGalleryImages(data.gallery_images)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch destination:", error)
        toast({
          title: "Error",
          description: "Failed to load destination. Please try again.",
          variant: "destructive",
        })
        router.push("/destinations")
      }
    }

    fetchDestination()
  }, [params.id, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleMainImageUpload = (url: string) => {
    setMainImage(url)
  }

  const handleGalleryImagesUpload = (urls: string[]) => {
    setGalleryImages(urls)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.city) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!mainImage) {
      toast({
        title: "Main image required",
        description: "Please upload a main image for the destination.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const destinationData = formatDestinationData({
        ...formData,
        images: [mainImage],
        gallery_images: galleryImages,
      })

      await destinationsApi.update(params.id, destinationData)

      toast({
        title: "Destination updated",
        description: "The destination has been successfully updated.",
        variant: "success",
      })

      // Delay navigation to allow toast to be seen
      setTimeout(() => {
        router.push("/destinations")
      }, 1000)
    } catch (error) {
      console.error("Failed to update destination:", error)
      toast({
        title: "Error",
        description: "Failed to update destination. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await destinationsApi.delete(params.id)

      toast({
        title: "Destination deleted",
        description: "The destination has been successfully deleted.",
        variant: "success",
      })

      // Delay navigation to allow toast to be seen
      setTimeout(() => {
        router.push("/destinations")
      }, 1000)
    } catch (error) {
      console.error("Failed to delete destination:", error)
      toast({
        title: "Error",
        description: "Failed to delete destination. Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Destination</h1>
          <p className="text-muted-foreground">Update the details for {destination?.title}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Destination
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Destination</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this destination? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit}>
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
                <CardDescription>Update the basic details of the destination.</CardDescription>
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
                <CardDescription>Update location information for the destination.</CardDescription>
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
                <CardDescription>Update images for this destination.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Main Image <span className="text-destructive">*</span>
                  </Label>
                  <ImageUpload
                    onUploadComplete={handleMainImageUpload}
                    label="Upload Main Image"
                    initialImage={mainImage}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be the primary image displayed for the destination.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Gallery Images</Label>
                  <MultipleImageUpload
                    onUploadComplete={handleGalleryImagesUpload}
                    label="Upload Gallery Images"
                    maxFiles={10}
                    initialImages={galleryImages}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add additional images to showcase different aspects of the destination.
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
                "Update Destination"
              )}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
