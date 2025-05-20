import { apiRequest } from "./api"

export interface BlogAuthor {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
}

export interface BlogComment {
  id: number
  post: number
  author: BlogAuthor
  content: string
  helpful_count: number
  reported: boolean
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  tags: string[]
  imageUrl: string
  author: BlogAuthor
  authorName: string
  status: "published" | "draft"
  views: number
  readTime: number
  featured: boolean
  created_at: string
  updated_at: string
}

export interface BlogPostsResponse {
  count: number
  next: string | null
  previous: string | null
  results: BlogPost[]
}

export interface BlogCommentsResponse {
  count: number
  next: string | null
  previous: string | null
  results: BlogComment[]
}

const blogApi = {
  // Get all blog posts with optional filtering
  getAll: async (params?: {
    page?: number
    search?: string
    status?: string
    featured?: boolean
  }): Promise<BlogPostsResponse> => {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.search) queryParams.append("search", params.search)
    if (params?.status) queryParams.append("status", params.status)
    if (params?.featured !== undefined) queryParams.append("featured", params.featured.toString())

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

    return apiRequest<BlogPostsResponse>(`/blog/posts/${queryString}`)
  },

  // Get a single blog post by ID
  getById: async (id: string | number): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`/blog/posts/${id}/`)
  },

  // Delete a blog post
  delete: async (id: string | number): Promise<void> => {
    return apiRequest<void>(`/blog/posts/${id}/`, "DELETE")
  },

  // Update a blog post's featured status
  updateFeatured: async (id: string | number, featured: boolean): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`/blog/posts/${id}/`, "PATCH", { featured })
  },

  // Update a blog post's status (published/draft)
  updateStatus: async (id: string | number, status: "published" | "draft"): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`/blog/posts/${id}/`, "PATCH", { status })
  },

  // Get comments for a blog post
  getComments: async (postId: string | number): Promise<BlogCommentsResponse> => {
    return apiRequest<BlogCommentsResponse>(`/blog/posts/${postId}/comments/`)
  },

  // Delete a comment
  deleteComment: async (postId: string | number, commentId: string | number): Promise<void> => {
    return apiRequest<void>(`/blog/posts/${postId}/comments/${commentId}/`, "DELETE")
  },
}

export default blogApi
