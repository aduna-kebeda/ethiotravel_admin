import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Mail, Search, User, XCircle } from "lucide-react"

export default function UsersPage() {
  // Mock data for users
  const users = [
    {
      id: "1",
      username: "johnsmith",
      email: "john.smith@example.com",
      firstName: "John",
      lastName: "Smith",
      role: "user",
      country: "United States",
      city: "New York",
      verified: true,
      status: "active",
      lastLogin: "2023-11-28",
      createdAt: "2023-09-15",
    },
    {
      id: "2",
      username: "mariag",
      email: "maria.garcia@example.com",
      firstName: "Maria",
      lastName: "Garcia",
      role: "business_owner",
      country: "Spain",
      city: "Barcelona",
      verified: true,
      status: "active",
      lastLogin: "2023-11-25",
      createdAt: "2023-10-02",
    },
    {
      id: "3",
      username: "davidchen",
      email: "david.chen@example.com",
      firstName: "David",
      lastName: "Chen",
      role: "user",
      country: "Canada",
      city: "Toronto",
      verified: true,
      status: "suspended",
      lastLogin: "2023-11-10",
      createdAt: "2023-08-28",
    },
    {
      id: "4",
      username: "sarahj",
      email: "sarah.johnson@example.com",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "user",
      country: "United Kingdom",
      city: "London",
      verified: false,
      status: "active",
      lastLogin: "2023-11-27",
      createdAt: "2023-11-05",
    },
    {
      id: "5",
      username: "ahmedm",
      email: "ahmed.mohammed@example.com",
      firstName: "Ahmed",
      lastName: "Mohammed",
      role: "business_owner",
      country: "Egypt",
      city: "Cairo",
      verified: true,
      status: "inactive",
      lastLogin: "2023-10-15",
      createdAt: "2023-07-17",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage user accounts on your platform.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search users..." className="w-full pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="business_owner">Business Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Verified</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-muted p-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
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
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col">
                    <span>{user.city}</span>
                    <span className="text-xs text-muted-foreground">{user.country}</span>
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.verified ? (
                    <Badge variant="outline" className="border-success bg-success/10 text-success">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-warning bg-warning/10 text-warning-foreground">
                      <XCircle className="mr-1 h-3 w-3" />
                      Unverified
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/users/${user.id}`}>View</Link>
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
