"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Globe, Plus, Search, Trash2, Edit, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  destinationsApi,
  ethiopianRegions,
  destinationCategories,
  statusOptions,
  type Destination,
} from "@/lib/api-destinations"

export default function DestinationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [region, setRegion] = useState<string>("all")
  const [category, setCategory] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchDestinations = async (filters?: any) => {
    setIsLoading(true)
    try {
      const apiFilters: any = {}

      if (filters?.region && filters.region !== "all") {
        apiFilters.region = filters.region
      }

      if (filters?.category && filters.category !== "all") {
        apiFilters.category = filters.category
      }

      if (filters?.status && filters.status !== "all") {
        apiFilters.status = filters.status
      }

      if (filters?.search) {
        apiFilters.search = filters.search
      }

      const response = await destinationsApi.getAll(apiFilters)
      setDestinations(response.results)
    } catch (error) {
      console.error("Failed to fetch destinations:", error)
      toast({
        title: "Error",
        description: "Failed to load destinations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDestinations()
  }, [])

  const handleSearch = () => {
    fetchDestinations({
      region,
      category,
      status,
      search: searchQuery,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await destinationsApi.delete(deleteId)
      setDestinations(destinations.filter((dest) => dest.id !== deleteId))
      toast({
        title: "Destination deleted",
        description: "The destination has been successfully deleted.",
        variant: "success",
      })
    } catch (error) {
      console.error("Failed to delete destination:", error)
      toast({
        title: "Error",
        description: "Failed to delete destination. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const getCategoryLabel = (value: string) => {
    const category = destinationCategories.find((c) => c.value === value)
    return category ? category.label : value
  }

  const getRegionLabel = (value: string) => {
    const region = ethiopianRegions.find((r) => r.value === value)
    return region ? region.label : value
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
          <p className="text-muted-foreground">Manage your travel destinations here.</p>
        </div>
        <Button asChild>
          <Link href="/destinations/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Destination
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search destinations..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {destinationCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {ethiopianRegions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Region</TableHead>
                <TableHead className="hidden lg:table-cell">City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Featured</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {destinations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No destinations found. Try adjusting your filters or add a new destination.
                  </TableCell>
                </TableRow>
              ) : (
                destinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-muted">
                          {destination.images && destination.images.length > 0 ? (
                            <img
                              src={destination.images[0] || "/placeholder.svg"}
                              alt={destination.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Globe className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="line-clamp-1">{destination.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{getCategoryLabel(destination.category)}</TableCell>
                    <TableCell className="hidden md:table-cell">{getRegionLabel(destination.region)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {destination.city}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          destination.status === "active"
                            ? "border-success bg-success/10 text-success"
                            : destination.status === "draft"
                              ? "border-warning bg-warning/10 text-warning"
                              : "border-destructive bg-destructive/10 text-destructive"
                        }
                      >
                        {destination.status
                          ? destination.status.charAt(0).toUpperCase() + destination.status.slice(1)
                          : "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {destination.featured ? (
                        <Badge variant="outline" className="border-accent bg-accent/10 text-accent-foreground">
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(destination.created_at ?? "").toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/destinations/${destination.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteId(destination.id ?? null)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Destination</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{destination.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
