"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, Mail, MapPin, Phone, User } from "lucide-react"

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userStatus, setUserStatus] = useState("active")

  // Mock user data
  const user = {
    id: params.id,
    username: "johnsmith",
    email: "john.smith@example.com",
    firstName: "John",
    lastName: "Smith",
    role: "user",
    profileImage: null,
    phoneNumber: "+1 (555) 123-4567",
    country: "United States",
    city: "New York",
    interests: ["Cultural Tours", "Adventure", "Historical Sites"],
    verified: true,
    status: "active",
    lastLogin: "2023-11-28T14:32:15Z",
    createdAt: "2023-09-15T10:20:30Z",
    updatedAt: "2023-11-28T14:32:15Z",
    bookings: [
      {
        id: "booking1",
        packageName: "Historic Northern Ethiopia Tour",
        date: "2023-10-05",
        status: "completed",
      },
      {
        id: "booking2",
        packageName: "Danakil Depression Adventure",
        date: "2023-12-15",
        status: "upcoming",
      },
    ],
    reviews: [
      {
        id: "review1",
        entityType: "package",
        entityName: "Historic Northern Ethiopia Tour",
        rating: 5,
        date: "2023-10-20",
      },
    ],
    recentActivity: [
      {
        type: "login",
        date: "2023-11-28T14:32:15Z",
        details: "Logged in from New York, United States",
      },
      {
        type: "booking",
        date: "2023-11-25T09:45:22Z",
        details: "Booked Danakil Depression Adventure",
      },
      {
        type: "review",
        date: "2023-10-20T16:18:05Z",
        details: "Reviewed Historic Northern Ethiopia Tour",
      },
    ],
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/users")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user.firstName} {user.lastName}
          </h1>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                user.status === "active"
                  ? "border-success bg-success/10 text-success"
                  : user.status === "suspended"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-muted bg-muted/50 text-muted-foreground"
              }
            >
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground">@{user.username}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/users">Back to List</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Basic details about the user.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {user.phoneNumber}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {user.city}, {user.country}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "admin"
                          ? "border-primary bg-primary/10 text-primary"
                          : user.role === "business_owner"
                            ? "border-secondary bg-secondary/10 text-secondary"
                            : "border-muted bg-muted/50 text-muted-foreground"
                      }
                    >
                      {user.role === "business_owner"
                        ? "Business Owner"
                        : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Joined</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Manage the user's account status.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Account Status</Label>
                    <Select value={userStatus} onValueChange={setUserStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {userStatus === "suspended" && (
                    <div className="space-y-2">
                      <Label htmlFor="suspensionReason">Reason for Suspension</Label>
                      <Textarea
                        id="suspensionReason"
                        placeholder="Provide a reason for suspension"
                        rows={4}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="verified">Email Verified</Label>
                      <Switch id="verified" checked={user.verified} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.verified
                        ? "User's email has been verified."
                        : "User's email has not been verified yet."}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>

        {/* Placeholder for activity and settings tabs */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>User's recent activities and bookings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Activity content goes here (e.g., bookings, reviews, recent activity).</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Additional user settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Settings content goes here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}