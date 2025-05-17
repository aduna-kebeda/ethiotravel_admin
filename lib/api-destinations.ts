import { apiRequest } from "./api"

// Destination type definition based on API response
export interface Destination {
  id: string
  user: string
  title: string
  slug: string
  description: string
  category: string
  region: string
  city: string
  address: string
  latitude: string
  longitude: string
  featured: boolean
  status: "draft" | "active" | "inactive"
  rating: string
  review_count: number
  images: string[]
  gallery_images: string[]
  created_at: string
  updated_at: string
  reviews?: any[]
}

// Available categories for destinations
export const destinationCategories = [
  { value: "historical", label: "Historical" },
  { value: "cultural", label: "Cultural" },
  { value: "natural", label: "Natural" },
  { value: "adventure", label: "Adventure" },
  { value: "religious", label: "Religious" },
  { value: "urban", label: "Urban" },
  { value: "rural", label: "Rural" },
  { value: "beach", label: "Beach" },
]

// Available regions in Ethiopia
export const ethiopianRegions = [
  { value: "addis_ababa", label: "Addis Ababa" },
  { value: "amhara", label: "Amhara" },
  { value: "afar", label: "Afar" },
  { value: "benishangul_gumuz", label: "Benishangul-Gumuz" },
  { value: "dire_dawa", label: "Dire Dawa" },
  { value: "gambela", label: "Gambela" },
  { value: "harari", label: "Harari" },
  { value: "oromia", label: "Oromia" },
  { value: "sidama", label: "Sidama" },
  { value: "somali", label: "Somali" },
  { value: "southern_nations", label: "Southern Nations" },
  { value: "tigray", label: "Tigray" },
]

// Status options for destinations
export const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

/**
 * Destinations API functions
 */
export const destinationsApi = {
  // Get all destinations with optional filters
  getAll: async (filters?: {
    category?: string
    region?: string
    city?: string
    featured?: boolean
    status?: string
    search?: string
    ordering?: string
    page?: number
  }) => {
    // Build query string from filters
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value))
        }
      })
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return apiRequest<{
      count: number
      next: string | null
      previous: string | null
      results: Destination[]
    }>(`/destinations/destinations/${queryString}`)
  },

  // Get a single destination by ID
  getById: async (id: string) => {
    if (!id) {
      throw new Error("Invalid destination ID")
    }
    return apiRequest<Destination>(`/destinations/destinations/${id}/`)
  },

  // Create a new destination with improved error handling
  create: async (destinationData: Partial<Destination>) => {
    try {
      console.log("Creating destination with data:", destinationData)
      return await apiRequest<Destination>("/destinations/destinations/", "POST", destinationData)
    } catch (error) {
      console.error("Failed to create destination:", error)
      throw error
    }
  },

  // Update a destination with improved error handling
  update: async (id: string, destinationData: Partial<Destination>) => {
    try {
      console.log("Updating destination with data:", destinationData)
      return await apiRequest<Destination>(`/destinations/destinations/${id}/`, "PUT", destinationData)
    } catch (error) {
      console.error("Failed to update destination:", error)
      throw error
    }
  },

  // Delete a destination
  delete: async (id: string) => {
    return apiRequest<void>(`/destinations/destinations/${id}/`, "DELETE")
  },
}

// Update the formatDestinationData function to ensure all required fields are properly formatted
export function formatDestinationData(data: any): Partial<Destination> {
  // Ensure images is always an array
  let images = data.images || []
  if (!Array.isArray(images)) {
    images = [images].filter(Boolean)
  }

  // Ensure gallery_images is always an array
  let galleryImages = data.gallery_images || []
  if (!Array.isArray(galleryImages)) {
    galleryImages = [galleryImages].filter(Boolean)
  }

  // Format coordinates properly
  const latitude = data.latitude || ""
  const longitude = data.longitude || ""

  // Ensure category is a string (API might expect a string, not an array)
  const category = Array.isArray(data.category) ? data.category[0] : data.category || "historical"

  return {
    title: data.title || "",
    description: data.description || "",
    category,
    region: data.region || "addis_ababa",
    city: data.city || "",
    address: data.address || "",
    latitude,
    longitude,
    featured: typeof data.featured === "string" ? data.featured === "true" : Boolean(data.featured),
    status: data.status || "draft",
    images,
    gallery_images: galleryImages,
  }
}
