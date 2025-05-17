"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Users, DollarSign, Tag, Star, Edit, ArrowLeft, Loader2 } from "lucide-react"
import { packageApi, type Package as PackageType } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const packageId = params.id as string
  const { toast } = useToast()

  const [packageData, setPackageData] = useState<PackageType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await packageApi.getById(packageId)
        setPackageData(data)
      } catch (error) {
        console.error("Failed to fetch package:", error)
        setError("Could not load the package details. Please try again.")

        toast({
          title: "Failed to load package",
          description: "Could not load the package details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackage()
  }, [packageId, toast])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading package details...</p>
        </div>
      </div>
    )
  }

  if (error || !packageData) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/packages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Packages
          </Link>
        </Button>

        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Package not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "inactive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild size="sm" className="h-8 px-2">
              <Link href="/packages">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{packageData.title}</h1>
          </div>
          <p className="text-muted-foreground">{packageData.short_description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(packageData.status)}>
            {packageData.status.charAt(0).toUpperCase() + packageData.status.slice(1)}
          </Badge>
          {packageData.featured && <Badge variant="default">Featured</Badge>}
          <Button asChild>
            <Link href={`/packages/${packageId}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Package
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={packageData.image || "/placeholder.svg?height=400&width=800"}
                alt={packageData.title}
                className="h-full w-full object-cover"
              />
            </div>

            <Tabs defaultValue="overview" className="p-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{packageData.description}</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {packageData.included?.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">What's Not Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {packageData.not_included?.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="mt-0.5 h-2 w-2 rounded-full bg-destructive" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6 space-y-6">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Day-by-Day Itinerary</h2>
                  <div className="space-y-4">
                    {packageData.itinerary?.map((day, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Day {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>{day}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Gallery</h2>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {packageData.gallery_images && packageData.gallery_images.length > 0 ? (
                      packageData.gallery_images.map((image, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded-md">
                          <img
                            src={image || "/placeholder.svg?height=300&width=300"}
                            alt={`${packageData.title} - Image ${index + 1}`}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      ))
                    ) : (
                      <p className="col-span-full text-center text-muted-foreground">No gallery images available</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>Key information about this package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    ${packageData.price}
                    {packageData.discounted_price && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">
                        ${packageData.discounted_price}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Price per person</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{packageData.duration}</p>
                  <p className="text-sm text-muted-foreground">{packageData.duration_in_days} days</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{packageData.location}</p>
                  <p className="text-sm text-muted-foreground">{packageData.region}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Max Group Size: {packageData.max_group_size}</p>
                  {packageData.min_age > 0 && (
                    <p className="text-sm text-muted-foreground">Minimum Age: {packageData.min_age}+</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex flex-wrap gap-2">
                    {packageData.category?.map((cat) => (
                      <Badge key={cat} variant="outline">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Departure: {packageData.departure}</p>
                  <p className="text-sm text-muted-foreground">
                    {packageData.departure_time} - {packageData.return_time}
                  </p>
                </div>
              </div>

              {packageData.difficulty && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Difficulty: {packageData.difficulty}</p>
                    </div>
                  </div>
                </>
              )}

              {packageData.tour_guide && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium">Tour Guide</p>
                    <p className="text-muted-foreground">{packageData.tour_guide}</p>
                  </div>
                </>
              )}

              {packageData.languages && packageData.languages.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium">Languages</p>
                    <p className="text-muted-foreground">{packageData.languages.join(", ")}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {packageData.coordinates && packageData.coordinates.length === 2 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video overflow-hidden rounded-md bg-muted">
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-sm text-muted-foreground">
                      Map view at {packageData.coordinates[0]}, {packageData.coordinates[1]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
