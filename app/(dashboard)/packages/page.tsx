"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Plus, Filter, Calendar, Tag, MapPin } from "lucide-react"
import { packageApi, type Package as PackageType } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function PackagesPage() {
  const { toast } = useToast()
  const [packages, setPackages] = useState<PackageType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true)
        const response = await packageApi.getAll()
        setPackages(response.results)
      } catch (error) {
        console.error("Failed to fetch packages:", error)
        toast({
          title: "Failed to load packages",
          description: "Could not load the packages. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackages()
  }, [toast])

  // Filter packages based on search term and filters
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      searchTerm === "" ||
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || pkg.category.includes(categoryFilter)
    const matchesStatus = statusFilter === "all" || pkg.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get unique categories for filter
  const categories = ["all", ...new Set(packages.flatMap((pkg) => pkg.category))]

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

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading packages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tour Packages</h1>
          <p className="text-muted-foreground">Manage your tour packages and offerings.</p>
        </div>
        <Button asChild>
          <Link href="/packages/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Package
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search packages..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-[180px]">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  <span>Category</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Status</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredPackages.length === 0 ? (
        <div className="flex h-[30vh] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <PackageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No packages found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "No packages match your search criteria. Try adjusting your filters."
                : "You haven't created any packages yet. Add your first package to get started."}
            </p>
            <Button asChild>
              <Link href="/packages/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Package
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="group">
              <Card className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
                <Link href={`/packages/view/${pkg.id}`}>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={pkg.image || "/placeholder.svg?height=200&width=400"}
                      alt={pkg.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute right-2 top-2">
                      <Badge className={getStatusColor(pkg.status)}>
                        {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
                      </Badge>
                    </div>
                    {pkg.featured && (
                      <div className="absolute left-2 top-2">
                        <Badge variant="default">Featured</Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1 text-xl">{pkg.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{pkg.short_description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 p-4 pt-0">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-4 w-4" />
                      {pkg.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {pkg.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      {pkg.category.map((cat) => (
                        <Badge key={cat} variant="outline">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Link>
                <CardFooter className="flex items-center justify-between border-t p-4">
                  <div className="font-medium">
                    ${pkg.price}
                    {pkg.discounted_price && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">${pkg.discounted_price}</span>
                    )}
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/packages/${pkg.id}`}>Edit</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}