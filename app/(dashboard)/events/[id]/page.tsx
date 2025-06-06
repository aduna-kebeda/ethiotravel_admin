"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { CalendarIcon, Clock, Trash } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { eventApi, formatEventData, type Event } from "@/lib/api-events"
import { useToast } from "@/components/ui/use-toast"
import ImageUpload from "@/components/events/image-upload"

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [event, setEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    address: "",
    latitude: "",
    longitude: "",
    startTime: "",
    capacity: "",
    price: "",
    featured: false,
    status: "draft",
    images: "",
  })

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    setIsLoading(true)
    try {
      const event = await eventApi.getById(eventId)
      setEvent(event)

      // Parse dates
      const startDateTime = new Date(event.start_date)
      const endDateTime = new Date(event.end_date)

      setStartDate(startDateTime)
      setEndDate(endDateTime)

      // Format time for input
      const hours = startDateTime.getHours().toString().padStart(2, "0")
      const minutes = startDateTime.getMinutes().toString().padStart(2, "0")
      const timeString = `${hours}:${minutes}`

      setFormData({
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        address: event.address || "",
        latitude: event.latitude || "",
        longitude: event.longitude || "",
        startTime: timeString,
        capacity: event.capacity.toString(),
        price: event.price,
        featured: event.featured,
        status: event.status,
        images: event.images,
      })
    } catch (error) {
      console.error("Failed to fetch event:", error)
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }))
  }

  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, images: url }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates",
        variant: "destructive",
      })
      return
    }

    if (!formData.images) {
      toast({
        title: "Missing image",
        description: "Please upload an image for the event",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format dates with time
      const startDateTime = new Date(startDate)
      const [hours, minutes] = formData.startTime.split(":").map(Number)
      startDateTime.setHours(hours || 0, minutes || 0)

      const endDateTime = new Date(endDate)
      endDateTime.setHours(hours || 0, minutes || 0)

      // Prepare data for API
      const eventData = {
        title: formData.title,
        description: formData.description,
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

      console.log("Updating event with data:", eventData)

      // Submit to API
      const updatedEvent = await eventApi.update(eventId, formatEventData(eventData))
      console.log("Event updated successfully:", updatedEvent)

      toast({
        title: "Success",
        description: "Event updated successfully",
      })

      router.push("/events")
    } catch (error) {
      console.error("Failed to update event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await eventApi.delete(eventId)
      toast({
        title: "Success",
        description: "Event deleted successfully",
      })
      router.push("/events")
    } catch (error) {
      console.error("Failed to delete event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground">Update event details and settings.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash className="mr-2 h-4 w-4" />
              Delete Event
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the event and all associated data.
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
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Deleting...
                  </span>
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
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update the basic details of your event.</CardDescription>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the event"
                    rows={5}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                  />
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
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    required
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Gondar"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g. Fasil Ghebbi, Gondar, Ethiopia"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coordinates">Coordinates (Optional)</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="latitude"
                      placeholder="Latitude (e.g. 12.6030)"
                      value={formData.latitude}
                      onChange={handleInputChange}
                    />
                    <Input
                      id="longitude"
                      placeholder="Longitude (e.g. 37.4521)"
                      value={formData.longitude}
                      onChange={handleInputChange}
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
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
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
                  />
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
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Update images for your event.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload onImageUploaded={handleImageUploaded} existingImageUrl={formData.images} />
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end gap-4">
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
                "Update Event"
              )}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
