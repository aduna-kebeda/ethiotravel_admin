import { apiRequest } from "./api"

// Business type definition based on API response
export interface Business {
  id: number
  name: string
  slug: string
  business_type: string
  description: string
  contact_email: string
  contact_phone: string
  website: string | null
  region: string
  city: string
  address: string
  latitude: string | null
  longitude: string | null
  main_image: string
  gallery_images: string[] | string
  social_media_links: string[] | string | Record<string, string>
  opening_hours: string[] | string | Record<string, string>
  facilities: string[] | string
  services: string[] | string
  team: string[] | string
  status: "pending" | "approved" | "rejected"
  is_verified: boolean
  is_featured: boolean
  verification_date: string | null
  average_rating: string
  total_reviews: number
  created_at: string
  updated_at: string
  owner?: {
    id: string
    username: string
    email: string
    first_name: string
    last_name: string
  }
  reviews?: BusinessReview[]
}

export interface BusinessReview {
  id: number
  business: number
  user: {
    id: string
    username: string
    email: string
    first_name: string
    last_name: string
  }
  rating: number
  comment: string
  helpful_votes: number
  is_reported: boolean
  created_at: string
  updated_at: string
}

// Business API functions
export const businessApi = {
  // Get all businesses
  getAll: async () => {
    return apiRequest<{
      count: number
      next: string | null
      previous: string | null
      results: Business[]
    }>("/business/businesses/")
  },

  // Get a single business by ID
  getById: async (id: number | string) => {
    if (!id || isNaN(Number(id))) {
      throw new Error("Invalid business ID")
    }
    return apiRequest<Business>(`/business/businesses/${id}/`)
  },

  // Get reviews for a business
  getReviews: async (id: number | string) => {
    if (!id || isNaN(Number(id))) {
      throw new Error("Invalid business ID")
    }
    return apiRequest<{
      count: number
      next: string | null
      previous: string | null
      results: BusinessReview[]
    }>(`/business/businesses/${id}/reviews/`)
  },

  // Verify a business
  verifyBusiness: async (id: number | string, data: Partial<Business>) => {
    if (!id || isNaN(Number(id))) {
      throw new Error("Invalid business ID")
    }
    return apiRequest<{ is_verified: boolean; verification_date: string }>(
      `/business/businesses/${id}/verify/`,
      "POST",
      data,
    )
  },

  // Update business status
  updateStatus: async (id: number | string, status: "approved" | "rejected", rejectionReason?: string) => {
    if (!id || isNaN(Number(id))) {
      throw new Error("Invalid business ID")
    }

    const data: { status: string; rejection_reason?: string } = { status }
    if (status === "rejected" && rejectionReason) {
      data.rejection_reason = rejectionReason
    }

    return apiRequest<Business>(`/business/businesses/${id}/`, "PATCH", data)
  },

  // Delete a business
  deleteBusiness: async (id: number | string) => {
    if (!id || isNaN(Number(id))) {
      throw new Error("Invalid business ID")
    }
    return apiRequest<void>(`/business/businesses/${id}/`, "DELETE")
  },
}

// Helper function to normalize business data
export function normalizeBusinessData(business: Business): Business {
  // Convert string arrays to actual arrays if they're strings
  const normalizedBusiness = { ...business }

  if (typeof normalizedBusiness.gallery_images === "string" && normalizedBusiness.gallery_images) {
    normalizedBusiness.gallery_images = normalizedBusiness.gallery_images.split(",")
  } else if (!Array.isArray(normalizedBusiness.gallery_images)) {
    normalizedBusiness.gallery_images = []
  }

  if (typeof normalizedBusiness.facilities === "string" && normalizedBusiness.facilities) {
    normalizedBusiness.facilities = normalizedBusiness.facilities.split(",")
  } else if (!Array.isArray(normalizedBusiness.facilities)) {
    normalizedBusiness.facilities = []
  }

  if (typeof normalizedBusiness.services === "string" && normalizedBusiness.services) {
    normalizedBusiness.services = normalizedBusiness.services.split(",")
  } else if (!Array.isArray(normalizedBusiness.services)) {
    normalizedBusiness.services = []
  }

  return normalizedBusiness
}
