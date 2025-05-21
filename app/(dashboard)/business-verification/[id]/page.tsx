"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react"
import { businessApi, normalizeBusinessData, type Business } from "@/lib/api-business"
import { useToast } from "@/hooks/use-toast"

export default function BusinessVerificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<"approved" | "rejected">("approved")
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id)
    }).catch((err) => {
      console.error("Failed to resolve params:", err)
      setError("Failed to load business ID.")
    })
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchBusinessDetails = async () => {
      try {
        setIsLoading(true)
        const data = await businessApi.getById(id)
        setBusiness(normalizeBusinessData(data))
        setError(null)
      } catch (err) {
        console.error("Failed to fetch business details:", err)
        setError("Failed to load business details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinessDetails()
  }, [id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!id) return

    setIsSubmitting(true)

    try {
      if (verificationStatus === "rejected") {
        // Delete the business if rejected
        await businessApi.deleteBusiness(id)
        toast({
          title: "Success",
          description: "Business has been rejected and deleted.",
          variant: "default",
        })
      } else {
        // First verify the business
        await businessApi.verifyBusiness(id, business || {})

        // Then update the status to approved
        await businessApi.updateStatus(id, "approved")

        toast({
          title: "Success",
          description: "Business has been approved.",
          variant: "default",
        })
      }

      router.push("/business-verification")
    } catch (err) {
      console.error("Failed to submit verification decision:", err)
      toast({
        title: "Error",
        description: "Failed to submit verification decision. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || id === null) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Business not found"}</AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/business-verification">Back to List</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{business.name}</h1>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                business.is_verified
                  ? "border-success bg-success/10 text-success"
                  : business.status === "rejected"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-warning bg-warning/10 text-warning-foreground"
              }
            >
              <span className="flex items-center gap-1">
                {business.is_verified ? (
                  <CheckCircle className="h-3 w-3" />
                ) : business.status === "rejected" ? (
                  <XCircle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {business.is_verified ? "Verified" : business.status === "rejected" ? "Rejected" : "Pending"}
              </span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Submitted on {new Date(business.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/business-verification">Back to List</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Business Details</TabsTrigger>
          <TabsTrigger value="owner">Owner Information</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Details about the business requesting verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Business Type</p>
                  <p className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {business.business_type}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <p className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {business.website || "Not provided"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {business.contact_email}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {business.contact_phone}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Region</p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {business.region}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">City</p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {business.city}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {business.address}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Opening Hours</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {typeof business.opening_hours === "string"
                      ? business.opening_hours
                      : Array.isArray(business.opening_hours)
                        ? business.opening_hours.join(", ")
                        : "Not provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{business.description}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Facilities</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(business.facilities) && business.facilities.length > 0 ? (
                    business.facilities.map((facility, index) => (
                      <Badge key={index} variant="secondary">
                        {facility}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No facilities listed</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Services</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(business.services) && business.services.length > 0 ? (
                    business.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No services listed</span>
                  )}
                </div>
              </div>

              {business.main_image && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Main Image</p>
                  <div className="overflow-hidden rounded-md">
                    <img
                      src={business.main_image || "/placeholder.svg"}
                      alt={business.name}
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=192&width=384"
                      }}
                    />
                  </div>
                </div>
              )}

              {Array.isArray(business.gallery_images) && business.gallery_images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Gallery Images</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {business.gallery_images.map((image, index) => (
                      <div key={index} className="overflow-hidden rounded-md">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${business.name} gallery ${index + 1}`}
                          className="h-24 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=96&width=96"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
              <CardDescription>Details about the business owner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {business.owner ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Owner Name</p>
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {business.owner.first_name} {business.owner.last_name}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Owner Email</p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {business.owner.email}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {business.owner.username}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Owner information not available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Reviews</CardTitle>
              <CardDescription>
                Reviews submitted by users for this business. Total: {business.total_reviews || 0}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {business.reviews && business.reviews.length > 0 ? (
                business.reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-accent text-accent" : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">
                          {review.user.first_name} {review.user.last_name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                    {review.is_reported && (
                      <div className="mt-2">
                        <Badge variant="outline" className="border-destructive bg-destructive/10 text-destructive">
                          Reported
                        </Badge>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No reviews available for this business.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Decision</CardTitle>
              <CardDescription>Approve or reject this business listing.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={verificationStatus}
                  onValueChange={(value) => setVerificationStatus(value as "approved" | "rejected")}
                  className="space-y-4"
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="approved" id="approved" />
                    <Label htmlFor="approved" className="flex items-center gap-2 font-normal">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Approve Business
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rejected" id="rejected" />
                    <Label htmlFor="rejected" className="flex items-center gap-2 font-normal">
                      <XCircle className="h-4 w-4 text-destructive" />
                      Reject Business
                    </Label>
                  </div>
                </RadioGroup>

                {verificationStatus === "rejected" && (
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                    <Textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection"
                      rows={4}
                      required
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/business-verification">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting || !id}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Submit Decision
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Star component for reviews
function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}