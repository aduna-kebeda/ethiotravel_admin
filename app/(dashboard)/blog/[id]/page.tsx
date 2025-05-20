"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
import { Clock, Eye, ArrowLeft, Calendar, User, Trash2, Flag } from "lucide-react"
import blogApi, { type BlogComment, type BlogPost } from "@/lib/api-blog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function BlogPostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params) // Unwrap the params Promise
  const id = resolvedParams.id
  const router = useRouter()
  const { toast } = useToast()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setIsLoading(true)
        const data = await blogApi.getById(id)
        setPost(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch blog post:", err)
        setError("Failed to load blog post. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogPost()
  }, [id])

  useEffect(() => {
    const fetchComments = async () => {
      if (!post) return

      try {
        setIsLoadingComments(true)
        const response = await blogApi.getComments(id)
        setComments(response.results)
      } catch (err) {
        console.error("Failed to fetch comments:", err)
        toast({
          title: "Error",
          description: "Failed to load comments. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingComments(false)
      }
    }

    if (post) {
      fetchComments()
    }
  }, [post, id, toast])

  const handleDelete = async () => {
    try {
      await blogApi.delete(id)
      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      })
      router.push("/blog")
    } catch (error) {
      console.error("Failed to delete blog post:", error)
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await blogApi.deleteComment(id, commentId)
      setComments(comments.filter((comment) => comment.id !== commentId))
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleToggleFeatured = async () => {
    if (!post) return

    try {
      await blogApi.updateFeatured(id, !post.featured)
      setPost({ ...post, featured: !post.featured })
      toast({
        title: "Success",
        description: `Blog post ${!post.featured ? "featured" : "unfeatured"} successfully.`,
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

  const handleUpdateStatus = async (status: "published" | "draft") => {
    if (!post) return

    try {
      await blogApi.updateStatus(id, status)
      setPost({ ...post, status })
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="text-destructive text-xl">{error}</div>
        <Button variant="outline" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
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
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : post ? (
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{post.authorName}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{post.views} views</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {post.tags &&
                  post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-primary bg-primary/10 text-primary">
                      {tag}
                    </Badge>
                  ))}
              </div>

              {post.imageUrl && (
                <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
                  <Image
                    src={post.imageUrl || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=300&width=800"
                    }}
                  />
                </div>
              )}

              <div className="prose prose-sm max-w-none dark:prose-invert">
                <h2 className="text-xl font-semibold mb-2">Excerpt</h2>
                <p className="text-muted-foreground">{post.excerpt}</p>

                <Separator className="my-6" />

                <h2 className="text-xl font-semibold mb-2">Content</h2>
                <div className="whitespace-pre-wrap">{post.content}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>

            {isLoadingComments ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">No comments yet.</CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {comment.author.first_name} {comment.author.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {comment.reported && (
                            <Badge variant="outline" className="border-destructive bg-destructive/10 text-destructive">
                              <Flag className="mr-1 h-3 w-3" />
                              Reported
                            </Badge>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this comment? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Blog Post Settings</CardTitle>
                <CardDescription>Manage the settings for this blog post.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Status</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={post.status === "published" ? "default" : "outline"}
                      onClick={() => handleUpdateStatus("published")}
                    >
                      Published
                    </Button>
                    <Button
                      variant={post.status === "draft" ? "default" : "outline"}
                      onClick={() => handleUpdateStatus("draft")}
                    >
                      Draft
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Featured</h3>
                  <div className="flex gap-2">
                    <Button variant={post.featured ? "default" : "outline"} onClick={handleToggleFeatured}>
                      {post.featured ? "Featured" : "Not Featured"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Metadata</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span>{post.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slug:</span>
                      <span>{post.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(post.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(post.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  )
}