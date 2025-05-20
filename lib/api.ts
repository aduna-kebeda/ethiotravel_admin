const API_BASE_URL = "https://ai-driven-travel.onrender.com/api"

/**
 * Make an authenticated API request with retry functionality
 */
export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  data?: any,
  retries = 2,
): Promise<T> {
  const accessToken = localStorage.getItem("accessToken")

  if (!accessToken && method !== "GET") {
    throw new Error("Authentication required")
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    // Add cache: 'no-store' to prevent caching issues
    cache: "no-store",
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`
    console.log(`Making ${method} request to ${url}`)
    if (data) {
      console.log("Request data:", JSON.stringify(data, null, 2))
    }

    const response = await fetch(url, config)

    // Handle 204 No Content response
    if (response.status === 204) {
      return {} as T
    }

    // Clone the response so we can read the body multiple times if needed
    const responseClone = response.clone()

    if (!response.ok) {
      let errorData = {}
      let errorText = ""

      try {
        // Try to get JSON response
        errorData = await response.json()
      } catch (e) {
        console.error("Failed to parse error response as JSON:", e)

        try {
          // Try to get text response if JSON parsing fails
          errorText = await responseClone.text()
          // Truncate long error messages
          const truncatedText = errorText.length > 500 ? errorText.substring(0, 500) + "..." : errorText
          console.error("Error response text:", truncatedText)
          errorData = { detail: "API request failed. Please try again later." }
        } catch (textError) {
          console.error("Failed to get error response text:", textError)
          errorData = { detail: "Unknown error" }
        }
      }

      // Log the error but don't show the full error object which might be large
      console.error(`API error (${response.status}) for ${url}`)

      // Extract error message from different possible formats
      let errorMessage = `API error (${response.status})`

      if (typeof errorData === "object" && errorData !== null) {
        const err = errorData as { detail?: string; message?: string; error?: string; errors?: any }
        if (err.detail) errorMessage = err.detail
        else if (err.message) errorMessage = err.message
        else if (err.error) errorMessage = err.error
        else if (err.errors) errorMessage = JSON.stringify(err.errors)
      } else if (errorText) {
        errorMessage = "API request failed. Please try again later."
      }

      throw new Error(errorMessage)
    }

    let responseData: T

    try {
      responseData = (await response.json()) as T
    } catch (e) {
      console.error("Failed to parse JSON response:", e)
      // If JSON parsing fails but the request was successful, return an empty object
      responseData = {} as T
    }

    // Add this right before the return responseData line in the try block
    if (method !== "GET") {
      console.log("API response:", JSON.stringify(responseData, null, 2))
    }

    return responseData
  } catch (error) {
    console.error("API request failed:", error)

    // Implement retry logic for GET requests
    if (method === "GET" && retries > 0) {
      console.log(`Retrying request (${retries} attempts left)...`)
      // Wait for 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return apiRequest<T>(endpoint, method, data, retries - 1)
    }

    throw error
  }
}

/**
 * Package API functions
 */
export const packageApi = {
  // Get all packages
  getAll: async () => {
    return apiRequest<{
      count: number
      results: Package[]
    }>("/packages/")
  },

  // Get a single package by ID
  getById: async (id: number | string) => {
    // Ensure id is a valid number
    if (!id || isNaN(Number(id))) {
      throw new Error("Invalid package ID")
    }
    return apiRequest<Package>(`/packages/${id}/`)
  },

  // Create a new package
  create: async (packageData: Partial<Package>) => {
    return apiRequest<Package>("/packages/", "POST", packageData)
  },

  // Update a package
  update: async (id: number | string, packageData: Partial<Package>) => {
    return apiRequest<Package>(`/packages/${id}/`, "PUT", packageData)
  },

  // Delete a package
  delete: async (id: number | string) => {
    return apiRequest<void>(`/packages/${id}/`, "DELETE")
  },
}

// Package type definition based on API response
export interface Package {
  id: number
  organizer: {
    id: string
    username: string
    email: string
    first_name: string
    last_name: string
  }
  title: string
  slug: string
  category: string[]
  location: string
  region: string
  price: string
  discounted_price: string
  duration: string
  duration_in_days: number
  image: string
  gallery_images: string[]
  rating: string
  featured: boolean
  status: "draft" | "active" | "inactive"
  description: string
  short_description: string
  included: string[]
  not_included: string[]
  itinerary: string[]
  departure: string
  departure_time: string
  return_time: string
  max_group_size: number
  min_age: number
  difficulty: "Easy" | "Moderate" | "Difficult"
  tour_guide: string
  languages: string[]
  coordinates: number[]
  reviews?: any[]
  departures?: any[]
  created_at?: string
}

// Format package data for API submission
export function formatPackageData(data: any): Partial<Package> {
  // Ensure gallery_images is always an array
  let galleryImages = data.gallery_images
  if (!galleryImages) {
    galleryImages = []
  } else if (!Array.isArray(galleryImages)) {
    galleryImages = [galleryImages]
  }

  // Ensure price and discounted_price are strings
  const price = data.price ? String(data.price) : ""
  const discountedPrice = data.discounted_price ? String(data.discounted_price) : ""

  // Ensure numeric fields are numbers
  const durationInDays =
    typeof data.duration_in_days === "number" ? data.duration_in_days : Number.parseInt(data.duration_in_days) || 1
  const maxGroupSize =
    typeof data.max_group_size === "number" ? data.max_group_size : Number.parseInt(data.max_group_size) || 10
  const minAge = typeof data.min_age === "number" ? data.min_age : Number.parseInt(data.min_age) || 0

  // Process coordinates
  let coordinates = data.coordinates
  if (typeof coordinates === "string") {
    coordinates = coordinates
      .split(",")
      .map(Number)
      .filter((n) => !isNaN(n))
  } else if (!Array.isArray(coordinates)) {
    coordinates = []
  }

  return {
    ...data,
    price,
    discounted_price: discountedPrice,
    duration_in_days: durationInDays,
    max_group_size: maxGroupSize,
    min_age: minAge,
    // Convert arrays to comma-separated strings if needed by the API
    category: Array.isArray(data.category) ? data.category : [data.category],
    included: Array.isArray(data.included) ? data.included : data.included.split(",").filter(Boolean),
    not_included: Array.isArray(data.not_included) ? data.not_included : data.not_included.split(",").filter(Boolean),
    itinerary: Array.isArray(data.itinerary) ? data.itinerary : data.itinerary.split(";").filter(Boolean),
    languages: Array.isArray(data.languages) ? data.languages : data.languages.split(",").filter(Boolean),
    coordinates,
    gallery_images: galleryImages,
  }
}
