"use client"

import type React from "react"
import { useState } from "react"
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
import { ImageUpload, MultipleImageUpload } from "@/components/packages/image-upload"
import { packageApi, formatPackageData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"

export default function NewPackagePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    category: "Cultural",
    location: "",
    region: "Ethiopia",
    price: "",
    discounted_price: "",
    duration: "",
    duration_in_days: 1,
    image: "",
    gallery_images: [] as string[],
    featured: false,
    status: "draft",
    description: "",
    short_description: "",
    included: "",
    not_included: "",
    itinerary: "",
    departure: "",
    departure_time: "08:00",
    return_time: "18:00",
    max_group_size: 10,
    min_age: 0,
    difficulty: "Easy",
    tour_guide: "",
    languages: "",
    coordinates: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleMainImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }))
    toast({
      title: "Main image uploaded",
      variant: "success",
    })
  }

  const handleGalleryImagesUpload = (urls: string[]) => {
    if (Array.isArray(urls) && urls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, ...urls],
      }))
      toast({
        title: `${urls.length} images added to gallery`,
        variant: "success",
      })
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }))
    toast({
      title: "Image removed from gallery",
      variant: "success",
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.title) throw new Error("Package title is required")
      if (!formData.description) throw new Error("Package description is required")
      if (!formData.price) throw new Error("Package price is required")
      if (!formData.image) throw new Error("Main package image is required")

      // Format data for API
      const packageData = formatPackageData(formData)
      console.log("Creating new package:", packageData)

      // Create package via API
      const response = await packageApi.create(packageData)
      console.log("Package created successfully:", response)

      toast({
        title: "Package created successfully",
        variant: "success",
      })

      router.push("/packages")
    } catch (error) {
      console.error("Failed to create package:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Failed to create package",
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
        <h1 className="text-3xl font-bold tracking-tight">Create New Package</h1>
        <p className="text-muted-foreground">Add a new tour package to your catalog.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of your tour package.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Package Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Historic Northern Ethiopia Tour"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    placeholder="Brief summary of the package (max 150 characters)"
                    maxLength={150}
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detailed description of the package"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 1200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discounted_price">Discounted Price (USD)</Label>
                    <Input
                      id="discounted_price"
                      name="discounted_price"
                      value={formData.discounted_price}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration_in_days">Duration (Days)</Label>
                    <Input
                      id="duration_in_days"
                      name="duration_in_days"
                      value={formData.duration_in_days}
                      onChange={handleNumberChange}
                      type="number"
                      min="1"
                      placeholder="e.g. 7"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Text)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 7 days"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Safari">Safari</SelectItem>
                      <SelectItem value="Historical">Historical</SelectItem>
                      <SelectItem value="Nature">Nature</SelectItem>
                      <SelectItem value="Religious">Religious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Main Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Northern Ethiopia"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    placeholder="e.g. Ethiopia"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coordinates">Coordinates (Latitude, Longitude)</Label>
                  <Input
                    id="coordinates"
                    name="coordinates"
                    value={formData.coordinates}
                    onChange={handleChange}
                    placeholder="e.g. 12.0333,39.0333"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter as latitude,longitude (e.g. 12.0333,39.0333)</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured Package</Label>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Featured packages are highlighted on the homepage.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
                <CardDescription>What's included and excluded in the package.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="included">What's Included</Label>
                  <Textarea
                    id="included"
                    name="included"
                    value={formData.included}
                    onChange={handleChange}
                    placeholder="List items included in the package, separated by commas (e.g. Accommodation,Meals,Transportation)"
                    rows={5}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate items with commas (e.g. Accommodation,Meals,Transportation)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="not_included">What's Excluded</Label>
                  <Textarea
                    id="not_included"
                    name="not_included"
                    value={formData.not_included}
                    onChange={handleChange}
                    placeholder="List items not included in the package, separated by commas (e.g. Flights,Visa fees,Personal expenses)"
                    rows={5}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate items with commas (e.g. Flights,Visa fees,Personal expenses)
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max_group_size">Max Group Size</Label>
                    <Input
                      id="max_group_size"
                      name="max_group_size"
                      value={formData.max_group_size}
                      onChange={handleNumberChange}
                      type="number"
                      min="1"
                      placeholder="e.g. 12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_age">Minimum Age</Label>
                    <Input
                      id="min_age"
                      name="min_age"
                      value={formData.min_age}
                      onChange={handleNumberChange}
                      type="number"
                      min="0"
                      placeholder="e.g. 12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => handleSelectChange("difficulty", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Difficult">Difficult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tour_guide">Tour Guide</Label>
                  <Input
                    id="tour_guide"
                    name="tour_guide"
                    value={formData.tour_guide}
                    onChange={handleChange}
                    placeholder="e.g. Abebe Kebede"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languages">Languages</Label>
                  <Input
                    id="languages"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    placeholder="e.g. English,Amharic"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Separate languages with commas (e.g. English,Amharic)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itinerary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Itinerary</CardTitle>
                <CardDescription>Day-by-day breakdown of the tour.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itinerary">Itinerary</Label>
                  <Textarea
                    id="itinerary"
                    name="itinerary"
                    value={formData.itinerary}
                    onChange={handleChange}
                    placeholder="Day-by-day breakdown, separated by semicolons (e.g. Day 1: Arrival;Day 2: Church tour)"
                    rows={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate days with semicolons (e.g. Day 1: Arrival;Day 2: Church tour)
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="departure">Departure Location</Label>
                    <Input
                      id="departure"
                      name="departure"
                      value={formData.departure}
                      onChange={handleChange}
                      placeholder="e.g. Addis Ababa"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departure_time">Departure Time</Label>
                    <Input
                      id="departure_time"
                      name="departure_time"
                      value={formData.departure_time}
                      onChange={handleChange}
                      type="time"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="return_time">Return Time</Label>
                    <Input
                      id="return_time"
                      name="return_time"
                      value={formData.return_time}
                      onChange={handleChange}
                      type="time"
                      required
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
                <CardDescription>Upload images for your package.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Image Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Main Image</h3>
                  {formData.image ? (
                    <div className="relative h-40 w-full overflow-hidden rounded-md border">
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Main package image"
                        className="h-full w-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full"
                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <ImageUpload
                      onUploadComplete={handleMainImageUpload}
                      label="Upload Main Image"
                    />
                  )}
                </div>

                {/* Gallery Images Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Gallery Images</h3>
                    <span className="text-sm text-muted-foreground">{formData.gallery_images.length} images</span>
                  </div>

                  {/* Display existing gallery images */}
                  {formData.gallery_images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {formData.gallery_images.map((image, index) => (
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
                            onClick={() => removeGalleryImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload gallery images */}
                  <div className="mt-4">
                    <MultipleImageUpload
                      onUploadComplete={handleGalleryImagesUpload}
                      label="Add Gallery Images"
                      maxFiles={10}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/packages">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </span>
              ) : (
                "Create Package"
              )}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}