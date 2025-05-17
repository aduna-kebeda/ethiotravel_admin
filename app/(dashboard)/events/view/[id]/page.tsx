"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Clock, Edit, Globe, MapPin, Star, Users } from "lucide-react"
import { eventApi, type Event } from "@/lib/api-events"
import { useToast } from "@/components/ui/use-toast"

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const { toast } = useToast()

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    setIsLoading(true)
    try {
      const eventData = await eventApi.getById(eventId)
      setEvent(eventData)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Event not found</h2>
        <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <Badge className="capitalize">{event.category}</Badge>
            {getStatusBadge(event.status)}
            {event.featured && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" /> Featured
              </Badge>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/events/${event.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Complete information about this event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {event.images && (
              <div className="overflow-hidden rounded-lg">
                <img
                  src={event.images || "/placeholder.svg"}
                  alt={event.title}
                  className="h-[300px] w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=600"
                  }}
                />
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Description</h3>
              <p className="whitespace-pre-line text-muted-foreground">{event.description}</p>
            </div>

            <Separator />

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Date & Time</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {formatDate(event.start_date)}
                      {new Date(event.start_date).toDateString() !== new Date(event.end_date).toDateString() &&
                        ` - ${formatDate(event.end_date)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatTime(event.start_date)} - {formatTime(event.end_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Location</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  {event.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>{event.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Capacity & Attendance</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {event.current_attendees} / {event.capacity} attendees
                  </span>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Price</h3>
                <div className="font-medium">
                  {Number.parseFloat(event.price) > 0 ? (
                    <span>${Number.parseFloat(event.price).toFixed(2)} USD</span>
                  ) : (
                    <span>Free</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Organizer</h3>
                <p className="font-medium">
                  {typeof event.organizer === "string" ? "Admin" : event.organizer.username}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p className="font-medium">{formatDate(event.created_at)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p className="font-medium">{formatDate(event.updated_at)}</p>
              </div>

              {event.rating && Number.parseFloat(event.rating) > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rating</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{Number.parseFloat(event.rating).toFixed(1)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {event.latitude && event.longitude && (
            <Card>
              <CardHeader>
                <CardTitle>Location Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video overflow-hidden rounded-md bg-muted">
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${event.latitude},${event.longitude}&zoom=14&size=400x300&markers=color:red%7C${event.latitude},${event.longitude}&key=YOUR_API_KEY`}
                    alt="Event location map"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=400&text=Map"
                    }}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Coordinates: {event.latitude}, {event.longitude}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/events">Back to Events</Link>
        </Button>
        <Button asChild>
          <Link href={`/events/${event.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Link>
        </Button>
      </div>
    </div>
  )
}
