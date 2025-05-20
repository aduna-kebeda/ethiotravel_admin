"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, FileText, Search, Trash2, User } from "lucide-react"
import blogApi, { type BlogPost } from "@/lib/api-blog"
import { useToast } from "@/hooks/use-toast"
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
import { Skeleton } from "@/components/ui/skeleton"

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true)
      const response = await blogApi.getAll()
      setBlogPosts(response.results)
    } catch (error) {
      console.error("Failed to fetch blog posts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch blog posts. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await blogApi.delete(id)
      setBlogPosts(blogPosts.filter((post) => post.id !== id))
      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete blog post:", error)
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleToggleFeatured = async (id: number, featured: boolean) => {
    try {
      await blogApi.updateFeatured(id, !featured)
      setBlogPosts(blogPosts.map((post) => (post.id === id ? { ...post, featured: !featured } : post)))
      toast({
        title: "Success",
        description: `Blog post ${!featured ? "featured" : "unfeatured"} successfully.`,
      })
    } catch (error) {
      console.error("Failed to update featured status:", error)
      toast({
        title: "Error",
        description: "Failed to update featured status. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (id: number, status: "published" | "draft") => {
    try {
      await blogApi.updateStatus(id, status)
      setBlogPosts(blogPosts.map((post) => (post.id === id ? { ...post, status } : post)))
      toast({
        title: "Success",
        description: `Blog post status updated to ${status}.`,
      })
    } catch (error) {
      console.error("Failed to update status:", error)
      toast({
        title: "Error",
        description: "Failed to update status. Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Filter posts based on search term, category, and status
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" ||
      (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(categoryFilter.toLowerCase())))

    const matchesStatus = statusFilter === "all" || post.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Extract unique categories from all posts' tags
  const categories = Array.from(new Set(blogPosts.flatMap((post) => post.tags || [])))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Manage your blog posts here.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category, index) => (
              <SelectItem key={index} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              <TableHead className="hidden md:table-cell">Tags</TableHead>
              <TableHead className="hidden md:table-cell">Stats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Featured</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No blog posts found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-primary/10 p-2">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <span className="line-clamp-1">{post.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>{post.authorName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.tags &&
                        post.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="border-primary bg-primary/10 text-primary">
                            {tag}
                          </Badge>
                        ))}
                      {post.tags && post.tags.length > 2 && (
                        <Badge variant="outline" className="border-muted bg-muted/50 text-muted-foreground">
                          +{post.tags.length - 2}
                        </Badge>
                      )}
                    </div>
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
                    <Select
                      defaultValue={post.status}
                      onValueChange={(value) => handleUpdateStatus(post.id, value as "published" | "draft")}
                    >
                      <SelectTrigger className="h-8 w-[100px]">
                        <SelectValue>
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
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleFeatured(post.id, post.featured)}>
                      {post.featured ? (
                        <Badge variant="outline" className="border-accent bg-accent/10 text-accent-foreground">
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not Featured</span>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(post.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/blog/${post.id}`}>View</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this blog post? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(post.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
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
    </div>
  )
}
