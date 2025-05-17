import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Flag, Search, Star, ThumbsUp, User, XCircle } from "lucide-react"

export default function ReviewsPage() {
  // Mock data for reviews
  const reviews = [
    {
      id: "1",
      userId: "user123",
      userName: "John Smith",
      entityType: "package",
      entityName: "Historic Northern Ethiopia Tour",
      rating: 5,
      title: "Amazing experience!",
      content: "This was the trip of a lifetime. The guides were knowledgeable and the accommodations were excellent.",
      status: "approved",
      helpfulCount: 12,
      reported: false,
      createdAt: "2023-11-15",
    },
    {
      id: "2",
      userId: "user456",
      userName: "Maria Garcia",
      entityType: "destination",
      entityName: "Lalibela",
      rating: 4,
      title: "Beautiful churches, but crowded",
      content:
        "The rock-hewn churches were incredible, but there were too many tourists during our visit. Still worth it though!",
      status: "approved",
      helpfulCount: 8,
      reported: false,
      createdAt: "2023-11-10",
    },
    {
      id: "3",
      userId: "user789",
      userName: "David Chen",
      entityType: "business",
      entityName: "Addis Ababa Grand Hotel",
      rating: 2,
      title: "Disappointing stay",
      content: "The room was not clean and the staff was unhelpful. Would not recommend.",
      status: "pending",
      helpfulCount: 3,
      reported: true,
      reportReason: "Potentially fake review",
      createdAt: "2023-11-05",
    },
    {
      id: "4",
      userId: "user101",
      userName: "Sarah Johnson",
      entityType: "package",
      entityName: "Danakil Depression Adventure",
      rating: 5,
      title: "Unforgettable adventure",
      content: "The Danakil Depression was otherworldly! Our guide was excellent and made the trip special.",
      status: "pending",
      helpfulCount: 0,
      reported: false,
      createdAt: "2023-11-20",
    },
    {
      id: "5",
      userId: "user202",
      userName: "Ahmed Mohammed",
      entityType: "business",
      entityName: "Lalibela Tours & Travel",
      rating: 1,
      title: "Terrible service",
      content: "They canceled our tour last minute without any explanation or refund. Avoid at all costs!",
      status: "rejected",
      helpfulCount: 5,
      reported: true,
      reportReason: "Potentially competitor review",
      createdAt: "2023-11-25",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">Manage user reviews across your platform.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search reviews..." className="w-full pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="package">Packages</SelectItem>
            <SelectItem value="destination">Destinations</SelectItem>
            <SelectItem value="business">Businesses</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
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
        <Select defaultValue="all">
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
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="font-medium">{review.title}</span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">{review.content}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>{review.userName}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground">
                      {review.entityType.charAt(0).toUpperCase() + review.entityType.slice(1)}
                    </span>
                    <span>{review.entityName}</span>
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
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {review.reported ? (
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
                    <span>{review.helpfulCount}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(review.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/reviews/${review.id}`}>Review</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
