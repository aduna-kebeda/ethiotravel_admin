"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { eventApi, formatEventData, type Event } from "@/lib/api-events"
import { useToast } from "@/components/ui/use-toast"
import ImageUpload from "@/components/events/image-upload"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

export default function NewEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "",
    location: "",
    address: "",
    latitude: "",
    longitude: "",
    startTime: "",
    capacity: "100",
    price: "0.00",
    featured: false,
    status: "draft",
    images: "",
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("basic")
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({})

  const scrollToFirstError = () => {
    const firstErrorField = Object.keys(formErrors)[0]
    if (firstErrorField) {
      const element = inputRefs.current[firstErrorField]
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.focus()
      } else {
        // Handle special cases like date fields
        const dateElement = document.getElementById(firstErrorField)
        if (dateElement) {
          dateElement.scrollIntoView({ behavior: "smooth", block: "center" })
          dateElement.focus()
        }
      }
    }
  }

  const validateField = (fieldName: string, value: any) => {
    const errors: Record<string, string> = { ...formErrors }

    switch (fieldName) {
      case "title":
        if (!value.trim()) {
          errors.title = "Title is required"
        } else {
          delete errors.title
        }
        break
      case "shortDescription":
        if (!value.trim()) {
          errors.shortDescription = "Short description is required"
        } else if (value.length > 150) {
          errors.shortDescription = "Short description must be 150 characters or less"
        } else {
          delete errors.shortDescription
        }
        break
      case "description":
        if (!value.trim()) {
          errors.description = "Description is required"
        } else {
          delete errors.description
        }
        break
      case "category":
        if (!value) {
          errors.category = "Category is required"
        } else {
          delete errors.category
        }
        break
      case "location":
        if (!value.trim()) {
          errors.location = "Location is required"
        } else {
          delete errors.location
        }
        break
      case "address":
        if (!value.trim()) {
          errors.address = "Address is required"
        } else {
          delete errors.address
        }
        break
      case "capacity":
        if (value) {
          const capacity = parseInt(value)
          if (isNaN(capacity) || capacity < 1) {
            errors.capacity = "Capacity must be a positive number"
          } else {
            delete errors.capacity
          }
        }
        break
      case "price":
        if (value) {
          const price = parseFloat(value)
          if (isNaN(price) || price < 0) {
            errors.price = "Price must be a non-negative number"
          } else {
            delete errors.price
          }
        }
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateBasicInfo = () => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = "Title is required"
    }

    if (!formData.shortDescription.trim()) {
      errors.shortDescription = "Short description is required"
    } else if (formData.shortDescription.length > 150) {
      errors.shortDescription = "Short description must be 150 characters or less"
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }

    if (!formData.category) {
      errors.category = "Category is required"
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required"
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required"
    }

    if (!startDate) {
      errors.startDate = "Start date is required"
    }

    if (!endDate) {
      errors.endDate = "End date is required"
    } else if (startDate && endDate < startDate) {
      errors.endDate = "End date must be after start date"
    }

    if (!formData.startTime) {
      errors.startTime = "Start time is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateDetails = () => {
    const errors: Record<string, string> = {}

    if (formData.capacity) {
      const capacity = parseInt(formData.capacity)
      if (isNaN(capacity) || capacity < 1) {
        errors.capacity = "Capacity must be a positive number"
      }
    }

    if (formData.price) {
      const price = parseFloat(formData.price)
      if (isNaN(price) || price < 0) {
        errors.price = "Price must be a non-negative number"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateMedia = () => {
    const errors: Record<string, string> = {}

    if (!formData.images) {
      errors.images = "At least one image is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    // Add real-time validation
    validateField(id, value)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    validateField(id, value)
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
    validateField(id, value)
  }

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }))
  }

  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, images: url }))
    // Clear error when image is uploaded
    if (formErrors.images) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.images
        return newErrors
      })
    }
  }

  const handleImageUploadProgress = (progress: number) => {
    setUploadProgress(progress)
  }

  const handleNextTab = () => {
    let isValid = true

    switch (activeTab) {
      case "basic":
        isValid = validateBasicInfo()
        break
      case "details":
        isValid = validateDetails()
        break
      case "media":
        isValid = validateMedia()
        break
    }

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before proceeding.",
        variant: "destructive",
      })
      scrollToFirstError()
      return
    }

    const tabOrder = ["basic", "details", "media"]
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
    }
  }

  const handlePreviousTab = () => {
    const tabOrder = ["basic", "details", "media"]
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
    }
  }

  useEffect(() => {
    if (startDate) {
      const errors = { ...formErrors }
      delete errors.startDate
      setFormErrors(errors)
    }
  }, [startDate])

  useEffect(() => {
    if (endDate) {
      const errors = { ...formErrors }
      delete errors.endDate
      if (startDate && endDate < startDate) {
        errors.endDate = "End date must be after start date"
      }
      setFormErrors(errors)
    }
  }, [endDate, startDate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate all sections
    const isBasicValid = validateBasicInfo()
    const isDetailsValid = validateDetails()
    const isMediaValid = validateMedia()

    if (!isBasicValid || !isDetailsValid || !isMediaValid) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors in the form before submitting.",
        variant: "destructive",
      })
      scrollToFirstError()
      return
    }

    setIsSubmitting(true)

    try {
      // Format dates with time
      const startDateTime = new Date(startDate!)
      const [hours, minutes] = formData.startTime.split(":").map(Number)
      startDateTime.setHours(hours || 0, minutes || 0)

      const endDateTime = new Date(endDate!)
      endDateTime.setHours(hours || 0, minutes || 0)

      // Prepare data for API
      const eventData = {
        title: formData.title,
        description: formData.description || formData.shortDescription,
        category: formData.category.toLowerCase(),
        location: formData.location,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        images: formData.images,
        capacity: Number.parseInt(formData.capacity),
        price: formData.price,
        featured: formData.featured,
        status: formData.status,
      }

      // Submit to API
      const createdEvent = await eventApi.create(formatEventData(eventData))

      toast({
        title: "Success",
        description: "Event created successfully",
      })

      router.push("/events")
    } catch (error: any) {
      console.error("Failed to create event:", error)
      
      // Handle API validation errors
      if (error.message) {
        try {
          const errorData = JSON.parse(error.message)
          if (typeof errorData === 'object') {
            const validationErrors: Record<string, string> = {}
            Object.entries(errorData).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                validationErrors[key] = value[0]
              } else if (typeof value === 'string') {
                validationErrors[key] = value
              }
            })
            setFormErrors(validationErrors)
            toast({
              title: "Validation Error",
              description: "Please fix the errors in the form.",
              variant: "destructive",
            })
            scrollToFirstError()
            return
          }
        } catch (e) {
          // If error message is not JSON, continue with normal error handling
        }
      }

      // Handle other errors
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground">Add a new event or festival to your platform.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={(value) => {
          // Only allow direct tab changes if going backwards
          const tabOrder = ["basic", "details", "media"]
          const currentIndex = tabOrder.indexOf(activeTab)
          const newIndex = tabOrder.indexOf(value)
          if (newIndex < currentIndex) {
            setActiveTab(value)
          } else {
            handleNextTab()
          }
        }} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of your event.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Timkat Festival"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={formErrors.title ? "border-destructive" : ""}
                    ref={(el) => {
                      if (el) inputRefs.current.title = el
                    }}
                  />
                  {formErrors.title && (
                    <p className="text-sm text-destructive">{formErrors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="Brief summary of the event (max 150 characters)"
                    maxLength={150}
                    rows={2}
                    required
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={formErrors.shortDescription ? "border-destructive" : ""}
                    ref={(el) => {
                      if (el) inputRefs.current.shortDescription = el
                    }}
                  />
                  {formErrors.shortDescription && (
                    <p className="text-sm text-destructive">{formErrors.shortDescription}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the event"
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={formErrors.description ? "border-destructive" : ""}
                    ref={(el) => {
                      if (el) inputRefs.current.description = el
                    }}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-destructive">{formErrors.description}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="startDate"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground",
                            formErrors.startDate && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? startDate.toLocaleDateString() : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                    {formErrors.startDate && (
                      <p className="text-sm text-destructive">{formErrors.startDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="endDate"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground",
                            formErrors.endDate && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? endDate.toLocaleDateString() : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                    {formErrors.endDate && (
                      <p className="text-sm text-destructive">{formErrors.endDate}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startTime"
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={formErrors.startTime ? "border-destructive" : ""}
                      ref={(el) => {
                        if (el) inputRefs.current.startTime = el
                      }}
                    />
                  </div>
                  {formErrors.startTime && (
                    <p className="text-sm text-destructive">{formErrors.startTime}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    required
                    value={formData.category}
                    onValueChange={(value) => {
                      handleSelectChange("category", value)
                      // Focus next field after selection
                      const locationInput = inputRefs.current.location
                      if (locationInput) {
                        locationInput.focus()
                      }
                    }}
                  >
                    <SelectTrigger className={formErrors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="religious">Religious</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="historical">Historical</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <p className="text-sm text-destructive">{formErrors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Gondar"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={formErrors.location ? "border-destructive" : ""}
                    ref={(el) => {
                      if (el) inputRefs.current.location = el
                    }}
                  />
                  {formErrors.location && (
                    <p className="text-sm text-destructive">{formErrors.location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g. Fasil Ghebbi, Gondar, Ethiopia"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={formErrors.address ? "border-destructive" : ""}
                    ref={(el) => {
                      if (el) inputRefs.current.address = el
                    }}
                  />
                  {formErrors.address && (
                    <p className="text-sm text-destructive">{formErrors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coordinates">Coordinates (Optional)</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="latitude"
                      placeholder="Latitude (e.g. 12.6030)"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      ref={(el) => {
                        if (el) inputRefs.current.latitude = el
                      }}
                    />
                    <Input
                      id="longitude"
                      placeholder="Longitude (e.g. 37.4521)"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      ref={(el) => {
                        if (el) inputRefs.current.longitude = el
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured Event</Label>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Featured events are highlighted on the homepage.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    defaultValue="draft"
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6 pt-4">
                <Button type="button" onClick={handleNextTab}>
                  Next: Additional Details
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Provide more information about the event.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={formErrors.capacity ? "border-destructive" : ""}
                    ref={(el) => {
                      if (el) inputRefs.current.capacity = el
                    }}
                  />
                  {formErrors.capacity && (
                    <p className="text-sm text-destructive">{formErrors.capacity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Ticket Price (USD, if applicable)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 10"
                    value={formData.price}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={formErrors.price ? "border-destructive" : ""}
                    ref={(el) => {
                      if (el) inputRefs.current.price = el
                    }}
                  />
                  {formErrors.price && (
                    <p className="text-sm text-destructive">{formErrors.price}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6 pt-4">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Back to Basic Info
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next: Media
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Upload images for your event.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  onUploadProgress={handleImageUploadProgress}
                  maxFiles={5}
                  acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
                  maxFileSize={5 * 1024 * 1024} // 5MB
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground text-right">
                      Uploading: {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
                {formErrors.images && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formErrors.images}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6 pt-4">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Back to Details
                </Button>
                <div className="flex gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/events">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      "Save Event"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}