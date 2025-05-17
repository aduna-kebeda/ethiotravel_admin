import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, FileText, Plus, Search, User } from "lucide-react"

export default function BlogPage() {
  // Mock data for blog posts
  const blogPosts = [
    {
      id: "1",
      title: "Top 10 Must-Visit Destinations in Ethiopia",
      slug: "top-10-must-visit-destinations-ethiopia",
      excerpt: "Discover the hidden gems and popular attractions across Ethiopia's diverse landscape.",
      category: "Travel Guide",
      tags: ["destinations", "travel", "guide"],
      author: "Abebe Kebede",
      status: "published",
      views: 1245,
      readTime: 8,
      featured: true,
      createdAt: "2023-10-15",
    },
    {
      id: "2",
      title: "Ethiopian Coffee Ceremony: A Cultural Experience",
      slug: "ethiopian-coffee-ceremony-cultural-experience",
      excerpt: "Learn about the traditional Ethiopian coffee ceremony and its cultural significance.",
      category: "Culture",
      tags: ["coffee", "culture", "tradition"],
      author: "Tigist Haile",
      status: "published",
      views: 987,
      readTime: 6,
      featured: true,
      createdAt: "2023-11-02",
    },
    {
      id: "3",
      title: "Hiking the Simien Mountains: A Complete Guide",
      slug: "hiking-simien-mountains-complete-guide",
      excerpt: "Everything you need to know about trekking through Ethiopia's stunning Simien Mountains.",
      category: "Adventure",
      tags: ["hiking", "mountains", "adventure"],
      author: "Daniel Mekonnen",
      status: "published",
      views: 756,
      readTime: 10,
      featured: false,
      createdAt: "2023-09-28",
    },
    {
      id: "4",
      title: "Ethiopian Festivals: When to Visit",
      slug: "ethiopian-festivals-when-to-visit",
      excerpt: "Plan your trip around Ethiopia's colorful and vibrant traditional festivals.",
      category: "Events",
      tags: ["festivals", "events", "culture"],
      author: "Sara Tadesse",
      status: "draft",
      views: 0,
      readTime: 7,
      featured: false,
      createdAt: "2023-12-05",
    },
    {
      id: "5",
      title: "Traditional Ethiopian Cuisine: What to Try",
      slug: "traditional-ethiopian-cuisine-what-to-try",
      excerpt: "A guide to the most delicious and authentic Ethiopian dishes every visitor should taste.",
      category: "Food",
      tags: ["food", "cuisine", "dining"],
      author: "Abebe Kebede",
      status: "published",
      views: 1102,
      readTime: 5,
      featured: true,
      createdAt: "2023-08-17",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Manage your blog posts here.</p>
        </div>
        <Button asChild>
          <Link href="/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Post
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search posts..." className="w-full pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="travel-guide">Travel Guide</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
            <SelectItem value="adventure">Adventure</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="food">Food</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Stats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Featured</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-faded-blue p-2">
                      <FileText className="h-4 w-4 text-secondary" />
                    </div>
                    <span>{post.title}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>{post.author}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="border-secondary bg-secondary/10 text-secondary">
                    {post.category}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{post.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{post.readTime} min</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      post.status === "published"
                        ? "border-success bg-success/10 text-success"
                        : "border-muted bg-muted/50 text-muted-foreground"
                    }
                  >
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {post.featured ? (
                    <Badge variant="outline" className="border-accent bg-accent/10 text-accent-foreground">
                      Featured
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${post.id}`}>Edit</Link>
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
