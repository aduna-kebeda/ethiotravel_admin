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

interface PackageFormData {
  title: string;
  category: string;
  location: string;
  region: string;
  price: string;
  discounted_price: string;
  duration: string;
  duration_in_days: number;
  image: string;
  gallery_images: string[];
  featured: boolean;
  status: string;
  description: string;
  short_description: string;
  included: string;
  not_included: string;
  itinerary: string;
  departure: string;
  departure_time: string;
  return_time: string;
  max_group_size: number;
  min_age: number;
  difficulty: string;
  tour_guide: string;
  languages: string;
  coordinates: string;
  [key: string]: string | number | boolean | string[];
}

interface ValidationErrors {
  [key: string]: string;
}

export default function NewPackagePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [currentTab, setCurrentTab] = useState("basic")
  const [lastErrorTime, setLastErrorTime] = useState<number>(0)

  // Form data state
  const [formData, setFormData] = useState<PackageFormData>({
    title: "",
    category: "cultural",
    location: "",
    region: "Ethiopia",
    price: "",
    discounted_price: "",
    duration: "",
    duration_in_days: 1,
    image: "",
    gallery_images: [],
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

  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'title':
        if (!value) return 'Title is required'
        if (value.length > 200) return 'Title must be less than 200 characters'
        return null
      case 'short_description':
        if (!value) return 'Short description is required'
        if (value.length > 300) return 'Short description must be less than 300 characters'
        return null
      case 'description':
        if (!value) return 'Description is required'
        return null
      case 'price':
        if (!value) return 'Price is required'
        if (isNaN(Number(value)) || Number(value) < 0) return 'Price must be a positive number'
        return null
      case 'discounted_price':
        if (value && (isNaN(Number(value)) || Number(value) < 0)) return 'Discounted price must be a positive number'
        if (value && Number(value) >= Number(formData.price)) return 'Discounted price must be less than regular price'
        return null
      case 'duration_in_days':
        if (!value) return 'Duration is required'
        if (value < 1 || value > 365) return 'Duration must be between 1 and 365 days'
        return null
      case 'max_group_size':
        if (!value) return 'Maximum group size is required'
        if (value < 1 || value > 1000) return 'Group size must be between 1 and 1000'
        return null
      case 'min_age':
        if (!value) return 'Minimum age is required'
        if (value < 0 || value > 120) return 'Minimum age must be between 0 and 120'
        return null
      case 'coordinates':
        if (!value) return 'Coordinates are required'
        const coordPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/
        if (!coordPattern.test(value)) return 'Invalid coordinates format. Use latitude,longitude (e.g. 12.0333,39.0333)'
        return null
      case 'location':
        if (!value) return 'Location is required'
        if (value.length > 100) return 'Location must be less than 100 characters'
        return null
      case 'region':
        if (!value) return 'Region is required'
        if (value.length > 100) return 'Region must be less than 100 characters'
        return null
      case 'departure':
        if (!value) return 'Departure location is required'
        if (value.length > 100) return 'Departure location must be less than 100 characters'
        return null
      case 'tour_guide':
        if (!value) return 'Tour guide is required'
        if (value.length > 100) return 'Tour guide name must be less than 100 characters'
        return null
      case 'languages':
        if (!value) return 'Languages are required'
        return null
      case 'image':
        if (!value) return 'Main image is required'
        return null
      default:
        return null
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    // Format price inputs
    if (name === 'price' || name === 'discounted_price') {
      formattedValue = value.replace(/[^\d.]/g, '')
      const parts = formattedValue.split('.')
      if (parts.length > 2) {
        formattedValue = parts[0] + '.' + parts.slice(1).join('')
      }
      if (parts.length === 2 && parts[1].length > 2) {
        formattedValue = parts[0] + '.' + parts[1].slice(0, 2)
      }
    }

    // Format coordinates
    if (name === 'coordinates') {
      formattedValue = value.replace(/[^\d.,]/g, '')
      const parts = formattedValue.split(',')
      if (parts.length > 2) {
        formattedValue = parts[0] + ',' + parts.slice(1).join('')
      }
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
    
    // Clear error for this field when user starts typing
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error for this field when user makes a selection
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = parseInt(value) || 0

    let validatedValue = numValue
    if (name === 'duration_in_days') {
      validatedValue = Math.min(Math.max(numValue, 1), 365)
    } else if (name === 'max_group_size') {
      validatedValue = Math.min(Math.max(numValue, 1), 1000)
    } else if (name === 'min_age') {
      validatedValue = Math.min(Math.max(numValue, 0), 120)
    }

    setFormData((prev) => ({ ...prev, [name]: validatedValue }))
    
    // Clear error for this field when user starts typing
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
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
      // Validate discount price
      if (formData.discounted_price && Number(formData.discounted_price) >= Number(formData.price)) {
        throw new Error('Discounted price must be less than the regular price')
      }

      // Validate coordinates format
      if (formData.coordinates) {
        const coordPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/
        if (!coordPattern.test(formData.coordinates)) {
          throw new Error('Invalid coordinates format. Use latitude,longitude (e.g. 12.0333,39.0333)')
        }
      }

      // Validate required fields
      const requiredFields = [
        'title', 'description', 'short_description', 'location', 'region',
        'price', 'duration', 'duration_in_days', 'image', 'departure',
        'departure_time', 'return_time', 'max_group_size', 'min_age',
        'tour_guide', 'languages'
      ]

      const missingFields = requiredFields.filter(field => !formData[field])
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Validate field lengths
      if (formData.title.length > 200) throw new Error('Title must be less than 200 characters')
      if (formData.short_description.length > 300) throw new Error('Short description must be less than 300 characters')
      if (formData.location.length > 100) throw new Error('Location must be less than 100 characters')
      if (formData.region.length > 100) throw new Error('Region must be less than 100 characters')
      if (formData.duration.length > 50) throw new Error('Duration must be less than 50 characters')
      if (formData.departure.length > 100) throw new Error('Departure location must be less than 100 characters')
      if (formData.tour_guide.length > 100) throw new Error('Tour guide name must be less than 100 characters')

      // Format data for API
      const packageData = formatPackageData(formData)
      console.log("Creating new package:", packageData)

      // Create package via API
      const response = await packageApi.create(packageData)
      console.log("Package created successfully:", response)

      toast({
        title: "Package created successfully",
        variant: "default",
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

  const validateTab = (tab: string): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    switch (tab) {
      case "basic":
        // Basic Info tab validation
        const basicFields = [
          'title', 'short_description', 'description', 'price', 'discounted_price',
          'duration', 'duration_in_days', 'category', 'location', 'region', 'coordinates'
        ]
        for (const field of basicFields) {
          const error = validateField(field, formData[field])
          if (error) {
            errors[field] = error
            isValid = false
            break
          }
        }
        break

      case "details":
        // Details tab validation
        const detailFields = [
          'included', 'not_included', 'max_group_size', 'min_age',
          'difficulty', 'tour_guide', 'languages'
        ]
        for (const field of detailFields) {
          const error = validateField(field, formData[field])
          if (error) {
            errors[field] = error
            isValid = false
            break
          }
        }
        break

      case "itinerary":
        // Itinerary tab validation
        const itineraryFields = [
          'itinerary', 'departure', 'departure_time', 'return_time'
        ]
        for (const field of itineraryFields) {
          const error = validateField(field, formData[field])
          if (error) {
            errors[field] = error
            isValid = false
            break
          }
        }
        break

      case "media":
        // Media tab validation
        if (!formData.image) {
          errors.image = 'Main image is required'
          isValid = false
        }
        break
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleTabChange = (value: string) => {
    // Clear previous errors
    setValidationErrors({})
    
    // Validate current tab before allowing change
    if (validateTab(currentTab)) {
      setCurrentTab(value)
    } else {
      // Get the first error message
      const firstError = Object.values(validationErrors)[0]
      
      // Prevent showing duplicate errors within 3 seconds
      const now = Date.now()
      if (now - lastErrorTime > 3000) {
        toast({
          title: "Required field missing",
          description: firstError,
          variant: "destructive",
        })
        setLastErrorTime(now)
      }
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
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
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
                    className={validationErrors.title ? "border-red-500" : ""}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-500">{validationErrors.title}</p>
                  )}
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
                    className={validationErrors.short_description ? "border-red-500" : ""}
                  />
                  {validationErrors.short_description && (
                    <p className="text-sm text-red-500">{validationErrors.short_description}</p>
                  )}
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
                    className={validationErrors.description ? "border-red-500" : ""}
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-red-500">{validationErrors.description}</p>
                  )}
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
                      className={validationErrors.price ? "border-red-500" : ""}
                    />
                    {validationErrors.price && (
                      <p className="text-sm text-red-500">{validationErrors.price}</p>
                    )}
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
                      className={validationErrors.discounted_price ? "border-red-500" : ""}
                    />
                    {validationErrors.discounted_price && (
                      <p className="text-sm text-red-500">{validationErrors.discounted_price}</p>
                    )}
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
                      className={validationErrors.duration_in_days ? "border-red-500" : ""}
                    />
                    {validationErrors.duration_in_days && (
                      <p className="text-sm text-red-500">{validationErrors.duration_in_days}</p>
                    )}
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
                    className={validationErrors.duration ? "border-red-500" : ""}
                  />
                  {validationErrors.duration && (
                    <p className="text-sm text-red-500">{validationErrors.duration}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="safari">Safari</SelectItem>
                      <SelectItem value="historical">Historical</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="religious">Religious</SelectItem>
                      <SelectItem value="beach">Beach</SelectItem>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="wildlife">Wildlife</SelectItem>
                      <SelectItem value="hiking">Hiking</SelectItem>
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
                    className={validationErrors.location ? "border-red-500" : ""}
                  />
                  {validationErrors.location && (
                    <p className="text-sm text-red-500">{validationErrors.location}</p>
                  )}
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
                    className={validationErrors.region ? "border-red-500" : ""}
                  />
                  {validationErrors.region && (
                    <p className="text-sm text-red-500">{validationErrors.region}</p>
                  )}
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
                    className={validationErrors.coordinates ? "border-red-500" : ""}
                  />
                  {validationErrors.coordinates && (
                    <p className="text-sm text-red-500">{validationErrors.coordinates}</p>
                  )}
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
                    className={validationErrors.included ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate items with commas (e.g. Accommodation,Meals,Transportation)
                  </p>
                  {validationErrors.included && (
                    <p className="text-sm text-red-500">{validationErrors.included}</p>
                  )}
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
                    className={validationErrors.not_included ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate items with commas (e.g. Flights,Visa fees,Personal expenses)
                  </p>
                  {validationErrors.not_included && (
                    <p className="text-sm text-red-500">{validationErrors.not_included}</p>
                  )}
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
                      className={validationErrors.max_group_size ? "border-red-500" : ""}
                    />
                    {validationErrors.max_group_size && (
                      <p className="text-sm text-red-500">{validationErrors.max_group_size}</p>
                    )}
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
                      className={validationErrors.min_age ? "border-red-500" : ""}
                    />
                    {validationErrors.min_age && (
                      <p className="text-sm text-red-500">{validationErrors.min_age}</p>
                    )}
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
                    className={validationErrors.tour_guide ? "border-red-500" : ""}
                  />
                  {validationErrors.tour_guide && (
                    <p className="text-sm text-red-500">{validationErrors.tour_guide}</p>
                  )}
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
                    className={validationErrors.languages ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground">Separate languages with commas (e.g. English,Amharic)</p>
                  {validationErrors.languages && (
                    <p className="text-sm text-red-500">{validationErrors.languages}</p>
                  )}
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
                    className={validationErrors.itinerary ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate days with semicolons (e.g. Day 1: Arrival;Day 2: Church tour)
                  </p>
                  {validationErrors.itinerary && (
                    <p className="text-sm text-red-500">{validationErrors.itinerary}</p>
                  )}
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
                      className={validationErrors.departure ? "border-red-500" : ""}
                    />
                    {validationErrors.departure && (
                      <p className="text-sm text-red-500">{validationErrors.departure}</p>
                    )}
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
                      className={validationErrors.departure_time ? "border-red-500" : ""}
                    />
                    {validationErrors.departure_time && (
                      <p className="text-sm text-red-500">{validationErrors.departure_time}</p>
                    )}
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
                      className={validationErrors.return_time ? "border-red-500" : ""}
                    />
                    {validationErrors.return_time && (
                      <p className="text-sm text-red-500">{validationErrors.return_time}</p>
                    )}
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