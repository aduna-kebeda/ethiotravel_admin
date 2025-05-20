"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Calendar, CheckCircle, Flag, Package, Star, ThumbsUp, User, XCircle, Building2, Globe } from "lucide-react"
import { businessApi, type Business, type BusinessReview } from "@/lib/api-business"
import { useToast } from "@/hooks/use-toast"

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params // Resolve the Promise
  const id = resolvedParams.id
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [review, setReview] = useState<(BusinessReview & { businessName: string; entityType: string }) | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved")
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        setIsLoading(true)

        // First get all businesses
        const businessResponse = await businessApi.getAll()
        const businessList = businessResponse.results

        // Find the review in all businesses
        let foundReview: (BusinessReview & { businessName: string; entityType: string }) | null = null
        let foundBusiness: Business | null = null

        for (const business of businessList) {
          // If reviews are already included in the business object
          if (business.reviews && business.reviews.length > 0) {
            const matchingReview = business.reviews.find((r: BusinessReview) => r.id.toString() === id)
            if (matchingReview) {
              foundReview = {
                ...matchingReview,
                businessName: business.name,
                entityType: "business",
              }
              foundBusiness = business
              break
            }
          } else if (business.total_reviews > 0) {
            // If we need to fetch reviews separately
            try {
              const reviewsResponse = await businessApi.getReviews(business.id)
              const matchingReview = reviewsResponse.results.find((r: BusinessReview) => r.id.toString() === id)
              if (matchingReview) {
                foundReview = {
                  ...matchingReview,
                  businessName: business.name,
                  entityType: "business",
                }
                foundBusiness = business
                break
              }
            } catch (err) {
              console.error(`Failed to fetch reviews for business ${business.id}:`, err)
            }
          }
        }

        if (foundReview && foundBusiness) {
          setReview(foundReview)
          setBusiness(foundBusiness)
          setError(null)
        } else {
          setError("Review not found")
        }
      } catch (err) {
        console.error("Failed to fetch review details:", err)
        setError("Failed to load review details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviewDetails()
  }, [id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real implementation, you would call an API to update the review status
      // For now, we'll just simulate a successful update

      toast({
        title: "Success",
        description: `Review has been ${reviewStatus === "approved" ? "approved" : "rejected"}.`,
        variant: "default",
      })

      router.push("/reviews")
    } catch (err) {
      console.error("Failed to submit review decision:", err)
      toast({
        title: "Error",
        description: "Failed to submit review decision. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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

  if (error || !review || !business) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Review not found"}</AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/reviews">Back to List</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Details</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-warning bg-warning/10 text-warning-foreground">
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-warning" />
                Pending
              </span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Submitted on {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/reviews">Back to List</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Content</CardTitle>
            <CardDescription>The content of the user review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-accent text-accent" : "fill-muted text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-sm">{review.rating}/5</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="whitespace-pre-line text-sm">{review.comment}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{review.helpful_votes} users found this helpful</span>
              </div>
              {review.is_reported && (
                <Badge variant="outline" className="border-destructive bg-destructive/10 text-destructive">
                  <Flag className="mr-1 h-3 w-3" />
                  Reported
                </Badge>
              )}
            </div>

            {review.is_reported && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <p className="font-medium">Report Reason:</p>
                <p>This review has been reported by users</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Details about the user who submitted the review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {review.user.first_name} {review.user.last_name}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{review.user.email}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p>{review.user.username}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Submitted On</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviewed Item</CardTitle>
              <CardDescription>The item that was reviewed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="flex items-center gap-2">
                  {review.entityType === "package" ? (
                    <Package className="h-4 w-4 text-primary" />
                  ) : review.entityType === "business" ? (
                    <Building2 className="h-4 w-4 text-secondary" />
                  ) : (
                    <Globe className="h-4 w-4 text-secondary" />
                  )}
                  {review.entityType.charAt(0).toUpperCase() + review.entityType.slice(1)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p>{review.businessName}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="text-sm text-muted-foreground">{business.id}</p>
              </div>

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/business-verification/${business.id}`}>View Business</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Decision</CardTitle>
          <CardDescription>Approve or reject this review.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <RadioGroup
              value={reviewStatus}
              onValueChange={(value) => setReviewStatus(value as "approved" | "rejected")}
              className="space-y-4"
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approved" id="approved" />
                <Label htmlFor="approved" className="flex items-center gap-2 font-normal">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Approve Review
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected" className="flex items-center gap-2 font-normal">
                  <XCircle className="h-4 w-4 text-destructive" />
                  Reject Review
                </Label>
              </div>
            </RadioGroup>

            {reviewStatus === "rejected" && (
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
              <Link href="/reviews">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {reviewStatus === "approved" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  Submit Decision
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}