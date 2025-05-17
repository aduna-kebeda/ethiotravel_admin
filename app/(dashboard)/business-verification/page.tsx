import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle, Clock, Search, XCircle } from "lucide-react"

export default function BusinessVerificationPage() {
  // Mock data for businesses
  const businesses = [
    {
      id: "1",
      businessName: "Addis Ababa Grand Hotel",
      businessType: "Hotel",
      region: "Addis Ababa",
      city: "Addis Ababa",
      phone: "+251 11 123 4567",
      email: "info@aagrandhotel.com",
      status: "pending",
      createdAt: "2023-11-15",
    },
    {
      id: "2",
      businessName: "Lalibela Tours & Travel",
      businessType: "Travel Agency",
      region: "Amhara",
      city: "Lalibela",
      phone: "+251 33 556 7890",
      email: "bookings@lalibelatours.com",
      status: "approved",
      verificationDate: "2023-12-01",
      verifiedBy: "Admin User",
      createdAt: "2023-11-10",
    },
    {
      id: "3",
      businessName: "Axum Traditional Restaurant",
      businessType: "Restaurant",
      region: "Tigray",
      city: "Axum",
      phone: "+251 34 789 1234",
      email: "contact@axumrestaurant.com",
      status: "rejected",
      rejectionReason: "Incomplete documentation",
      createdAt: "2023-11-05",
    },
    {
      id: "4",
      businessName: "Bale Mountain Lodge",
      businessType: "Lodge",
      region: "Oromia",
      city: "Bale",
      phone: "+251 46 123 7890",
      email: "reservations@balemountainlodge.com",
      status: "pending",
      createdAt: "2023-11-20",
    },
    {
      id: "5",
      businessName: "Harar Heritage Guesthouse",
      businessType: "Guesthouse",
      region: "Harari",
      city: "Harar",
      phone: "+251 25 667 8901",
      email: "stay@hararheritage.com",
      status: "pending",
      createdAt: "2023-11-25",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Verification</h1>
        <p className="text-muted-foreground">Review and verify business listings.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search businesses..." className="w-full pl-8" />
        </div>
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Region</TableHead>
              <TableHead className="hidden md:table-cell">City</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-faded-blue p-2">
                      <Building2 className="h-4 w-4 text-secondary" />
                    </div>
                    <span>{business.businessName}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{business.businessType}</TableCell>
                <TableCell className="hidden md:table-cell">{business.region}</TableCell>
                <TableCell className="hidden md:table-cell">{business.city}</TableCell>
                <TableCell className="hidden md:table-cell">{business.phone}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(business.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/business-verification/${business.id}`}>Review</Link>
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
