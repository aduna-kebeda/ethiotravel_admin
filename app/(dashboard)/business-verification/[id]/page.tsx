"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

export default function BusinessVerificationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState("pending")
  const [rejectionReason, setRejectionReason] = useState("")

  // Mock business data
  const business = {
    id: params.id,
    businessName: "Addis Ababa Grand Hotel",
    businessType: "Hotel",
    description:
      "A luxury hotel located in the heart of Addis Ababa, offering premium accommodations with modern amenities and traditional Ethiopian hospitality.",
    region: "Addis Ababa",
    city: "Addis Ababa",
    address: "Bole Road, Near Millennium Hall",
    phone: "+251 11 123 4567",
    email: "info@aagrandhotel.com",
    website: "www.aagrandhotel.com",
    status: "pending",
    openingHours: "24/7",
    facilities: ["Wi-Fi", "Restaurant", "Swimming Pool", "Conference Room", "Spa"],
    services: ["Room Service", "Airport Shuttle", "Laundry", "Tour Desk"],
    ownerName: "Abebe Kebede",
    ownerEmail: "abebe@aagrandhotel.com",
    ownerPhone: "+251 91 234 5678",
    documents: [
      { name: "Business License", url: "#" },
      { name: "Tax Registration", url: "#" },
      { name: "Owner ID", url: "#" },
    ],
    createdAt: "2023-11-15",
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/business-verification")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{business.businessName}</h1>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                business.status === "approved"
                  ? "border-success bg-success/10 text-success"
                  : business.status === "rejected"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-warning bg-warning/10 text-warning-foreground"
              }
            >
              <span className="flex items-center gap-1">
                {business.status === "approved" ? (
                  <CheckCircle className="h-3 w-3" />
                ) : business.status === "rejected" ? (
                  <XCircle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
              </span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Submitted on {new Date(business.createdAt).toLocaleDateString()}
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
          <TabsTrigger value="documents">Documents</TabsTrigger>
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
                    {business.businessType}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <p className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {business.website}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {business.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {business.phone}
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
                    {business.openingHours}
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
                  {business.facilities.map((facility, index) => (
                    <Badge key={index} variant="secondary">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Services</p>
                <div className="flex flex-wrap gap-2">
                  {business.services.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
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
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Owner Name</p>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {business.ownerName}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Owner Email</p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {business.ownerEmail}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Owner Phone</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {business.ownerPhone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
              <CardDescription>Review the documents provided by the business.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {business.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-4">
                    <div className="font-medium">{doc.name}</div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={doc.url} target="_blank">
                        View Document
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
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
                  onValueChange={setVerificationStatus}
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
                <Button type="submit" disabled={isSubmitting}>
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
