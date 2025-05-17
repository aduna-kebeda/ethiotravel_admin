"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Plus, Search, Star, StarOff } from "lucide-react"
import { eventApi, type Event } from "@/lib/api-events"
import { useToast } from "@/components/ui/use-toast"

export default function EventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)

  useEffect(() => {
    fetchEvents()
  }, [searchQuery, categoryFilter, statusFilter, currentPage])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const filters: any = {
        page: currentPage,
      }

      if (searchQuery) filters.search = searchQuery
      if (categoryFilter) filters.category = categoryFilter
      if (statusFilter) filters.status = statusFilter

      const response = await eventApi.getAll(filters)
      setEvents(response.results)
      setTotalEvents(response.count)

      // Calculate total pages (assuming 10 items per page)
      const pages = Math.ceil(response.count / 10)
      setTotalPages(pages > 0 ? pages : 1)
    } catch (error) {
      console.error("Failed to fetch events:", error)
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
    fetchEvents()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage cultural events and festivals across Ethiopia.</p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>A list of all events in your platform. You can filter and search events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="historical">Historical</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full sm:w-auto">
                Filter
              </Button>
            </form>

            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="rounded-full bg-muted p-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No events found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || categoryFilter || statusFilter
                    ? "Try adjusting your search or filters"
                    : "Get started by creating a new event."}
                </p>
                <Button asChild className="mt-6">
                  <Link href="/events/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="hidden md:table-cell">Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Link href={`/events/view/${event.id}`} aria-label={`View details for ${event.title}`}>
                            <div className="flex items-center gap-2">
                              {event.images && (
                                <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                  <img
                                    src={event.images || "/placeholder.svg"}
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=40&width=40"
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-medium">{event.title}</span>
                                <span className="text-xs text-muted-foreground md:hidden">
                                  {formatDate(event.start_date)}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Link href={`/events/view/${event.id}`} aria-label={`View details for ${event.title}`}>
                            <span className="capitalize">{event.category}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Link href={`/events/view/${event.id}`} aria-label={`View details for ${event.title}`}>
                            {formatDate(event.start_date)}
                            {event.start_date !== event.end_date && ` - ${formatDate(event.end_date)}`}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Link href={`/events/view/${event.id}`} aria-label={`View details for ${event.title}`}>
                            {event.location}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/events/view/${event.id}`} aria-label={`View details for ${event.title}`}>
                            {getStatusBadge(event.status)}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Link href={`/events/view/${event.id}`} aria-label={`View details for ${event.title}`}>
                            {event.featured ? (
                              <Star className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="icon">
                            <Link href={`/events/${event.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
        {!isLoading && events.length > 0 && (
          <CardFooter className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{events.length}</span> of{" "}
              <span className="font-medium">{totalEvents}</span> events
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i
                    }
                    if (currentPage > totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    }
                  }

                  if (pageNum <= totalPages) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink isActive={pageNum === currentPage} onClick={() => setCurrentPage(pageNum)}>
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }
                  return null
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}