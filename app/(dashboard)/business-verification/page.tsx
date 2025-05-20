"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Building2, CheckCircle, Clock, MapPin, Search, XCircle } from "lucide-react"
import { businessApi, normalizeBusinessData, type Business } from "@/lib/api-business"

export default function BusinessVerificationPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setIsLoading(true)
        const data = await businessApi.getAll()
        const normalizedBusinesses = data.results.map(normalizeBusinessData)
        setBusinesses(normalizedBusinesses)
        setFilteredBusinesses(normalizedBusinesses)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch businesses:", err)
        setError("Failed to load businesses. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBusinesses(businesses)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = businesses.filter(
        (business) =>
          business.name.toLowerCase().includes(query) ||
          business.business_type.toLowerCase().includes(query) ||
          business.region.toLowerCase().includes(query) ||
          business.city.toLowerCase().includes(query),
      )
      setFilteredBusinesses(filtered)
    }
  }, [searchQuery, businesses])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Verification</h1>
          <p className="text-muted-foreground">Review and verify business listings.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search businesses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-0">
                <Skeleton className="h-48 rounded-none" />
              </CardHeader>
              <CardContent className="p-6">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-4 h-4 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6 pt-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredBusinesses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No businesses found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery ? "Try adjusting your search query." : "There are no businesses to verify at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <img
                    src={business.main_image || "/placeholder.svg?height=192&width=384"}
                    alt={business.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=192&width=384"
                    }}
                  />
                  <Badge
                    variant="outline"
                    className={`absolute right-2 top-2 ${
                      business.is_verified
                        ? "border-success bg-success/10 text-success"
                        : business.status === "rejected"
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-warning bg-warning/10 text-warning-foreground"
                    }`}
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
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="mb-1 text-lg font-medium">{business.name}</h3>
                <p className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {business.business_type}
                </p>
                <p className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {business.city}, {business.region}
                </p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{business.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6 pt-4">
                <p className="text-sm text-muted-foreground">
                  Submitted: {new Date(business.created_at).toLocaleDateString()}
                </p>
                <Button asChild>
                  <Link href={`/business-verification/${business.id}`}>Review</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
