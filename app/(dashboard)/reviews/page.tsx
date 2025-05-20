"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Flag, Search, Star, ThumbsUp, User } from "lucide-react"
import { businessApi, type Business, type BusinessReview } from "@/lib/api-business"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReviewsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [reviews, setReviews] = useState<(BusinessReview & { businessName: string; entityType: string })[]>([])
  const [filteredReviews, setFilteredReviews] = useState<
    (BusinessReview & { businessName: string; entityType: string })[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [entityFilter, setEntityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [reportedFilter, setReportedFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // First get all businesses
        const businessResponse = await businessApi.getAll()
        const businessList = businessResponse.results
        setBusinesses(businessList)

        // Then collect all reviews from each business
        const allReviews: (BusinessReview & { businessName: string; entityType: string })[] = []

        for (const business of businessList) {
          if (business.reviews && business.reviews.length > 0) {
            // If reviews are already included in the business object
            business.reviews.forEach((review: BusinessReview) => {
              allReviews.push({
                ...review,
                businessName: business.name,
                entityType: "business",
              })
            })
          } else if (business.total_reviews > 0) {
            // If we need to fetch reviews separately
            try {
              const reviewsResponse = await businessApi.getReviews(business.id)
              reviewsResponse.results.forEach((review: BusinessReview) => {
                allReviews.push({
                  ...review,
                  businessName: business.name,
                  entityType: "business",
                })
              })
            } catch (err) {
              console.error(`Failed to fetch reviews for business ${business.id}:`, err)
            }
          }
        }

        setReviews(allReviews)
        setFilteredReviews(allReviews)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch reviews:", err)
        setError("Failed to load reviews. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Filter reviews based on search query, entity type, status, and reported status
    let filtered = reviews

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (review) =>
          review.businessName.toLowerCase().includes(query) ||
          review.comment.toLowerCase().includes(query) ||
          (review.user.first_name + " " + review.user.last_name).toLowerCase().includes(query),
      )
    }

    if (entityFilter !== "all") {
      filtered = filtered.filter((review) => review.entityType === entityFilter)
    }

    if (statusFilter !== "all") {
      // For now, we don't have a status field in reviews, so this is a placeholder
      // In a real implementation, you would filter by the review status
    }

    if (reportedFilter !== "all") {
      filtered = filtered.filter((review) => (reportedFilter === "reported" ? review.is_reported : !review.is_reported))
    }

    setFilteredReviews(filtered)
  }, [reviews, searchQuery, entityFilter, statusFilter, reportedFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">Manage user reviews across your platform.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reviews..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="business">Businesses</SelectItem>
            <SelectItem value="package">Packages</SelectItem>
            <SelectItem value="destination">Destinations</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={reportedFilter} onValueChange={setReportedFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Reported" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="reported">Reported Only</SelectItem>
            <SelectItem value="not-reported">Not Reported</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Review</TableHead>
              <TableHead className="hidden md:table-cell">User</TableHead>
              <TableHead className="hidden md:table-cell">Entity</TableHead>
              <TableHead className="hidden md:table-cell">Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Reported</TableHead>
              <TableHead className="hidden md:table-cell">Helpful</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No reviews found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {review.comment.length > 30 ? review.comment.substring(0, 30) + "..." : review.comment}
                      </span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">{review.comment}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {review.user.first_name} {review.user.last_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground">
                        {review.entityType.charAt(0).toUpperCase() + review.entityType.slice(1)}
                      </span>
                      <span>{review.businessName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating ? "fill-accent text-accent" : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-xs">{review.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-warning bg-warning/10 text-warning-foreground">
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full bg-warning" />
                        Pending
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {review.is_reported ? (
                      <Badge variant="outline" className="border-destructive bg-destructive/10 text-destructive">
                        <Flag className="mr-1 h-3 w-3" />
                        Reported
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                      <span>{review.helpful_votes}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(review.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/reviews/${review.id}`}>Review</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
