"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar, CheckCircle, Flag, Package, Star, ThumbsUp, User, XCircle, Building2, Globe } from "lucide-react"

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewStatus, setReviewStatus] = useState("pending")
  const [rejectionReason, setRejectionReason] = useState("")

  // Mock review data
  const review = {
    id: params.id,
    userId: "user123",
    userName: "John Smith",
    userEmail: "john.smith@example.com",
    entityType: "package",
    entityId: "pkg123",
    entityName: "Historic Northern Ethiopia Tour",
    rating: 5,
    title: "Amazing experience!",
    content:
      "This was the trip of a lifetime. The guides were knowledgeable and the accommodations were excellent. We visited Lalibela, Axum, and Gondar, and each place was more impressive than the last. The rock-hewn churches of Lalibela were particularly stunning. Our guide, Abebe, was fantastic and shared so much about Ethiopian history and culture. The food was delicious and we felt safe and well-cared for throughout the journey. I would highly recommend this tour to anyone interested in history, culture, and beautiful landscapes.",
    images: ["image1.jpg", "image2.jpg"],
    status: "pending",
    helpfulCount: 12,
    reported: true,
    reportReason: "Potentially fake review",
    createdAt: "2023-11-15",
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/reviews")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Details</h1>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                review.status === "approved"
                  ? "border-success bg-success/10 text-success"
                  : review.status === "rejected"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-warning bg-warning/10 text-warning-foreground"
              }
            >
              <span className="flex items-center gap-1">
                {review.status === "approved" ? (
                  <CheckCircle className="h-3 w-3" />
                ) : review.status === "rejected" ? (
                  <XCircle className="h-3 w-3" />
                ) : (
                  <span className="h-3 w-3 rounded-full bg-warning" />
                )}
                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
              </span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Submitted on {new Date(review.createdAt).toLocaleDateString()}
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
              <h3 className="text-xl font-bold">{review.title}</h3>
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
              <p className="whitespace-pre-line text-sm">{review.content}</p>
            </div>

            {review.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Attached Images</p>
                <div className="flex flex-wrap gap-2">
                  {review.images.map((image, index) => (
                    <div key={index} className="h-20 w-20 rounded-md bg-muted"></div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{review.helpfulCount} users found this helpful</span>
              </div>
              {review.reported && (
                <Badge variant="outline" className="border-destructive bg-destructive/10 text-destructive">
                  <Flag className="mr-1 h-3 w-3" />
                  Reported
                </Badge>
              )}
            </div>

            {review.reported && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <p className="font-medium">Report Reason:</p>
                <p>{review.reportReason}</p>
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
                  {review.userName}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{review.userEmail}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Submitted On</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(review.createdAt).toLocaleDateString()}
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
                <p>{review.entityName}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="text-sm text-muted-foreground">{review.entityId}</p>
              </div>

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link
                  href={
                    review.entityType === "package"
                      ? `/packages/${review.entityId}`
                      : review.entityType === "business"
                        ? `/business-verification/${review.entityId}`
                        : `/destinations/${review.entityId}`
                  }
                >
                  View {review.entityType.charAt(0).toUpperCase() + review.entityType.slice(1)}
                </Link>
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
            <RadioGroup value={reviewStatus} onValueChange={setReviewStatus} className="space-y-4" required>
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
