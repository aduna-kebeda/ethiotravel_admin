import { apiRequest } from "./api"

// Event type definition based on API response
export interface Event {
  id: number
  organizer:
    | string
    | {
        id: string
        username: string
        email: string
        first_name: string
        last_name: string
      }
  title: string
  slug: string
  description: string
  category: string
  location: string
  address: string
  latitude: string
  longitude: string
  start_date: string
  end_date: string
  images: string
  capacity: number
  current_attendees: number
  price: string
  featured: boolean
  status: "draft" | "published" | "cancelled"
  rating: string
  created_at: string
  updated_at: string
  reviews?: any[]
  registrations?: any[]
}

// Event API functions
export const eventApi = {
  // Get all events with optional filters
  getAll: async (filters?: {
    category?: string
    featured?: boolean
    status?: string
    search?: string
    page?: number
    full_details?: boolean
  }) => {
    // Build query string from filters
    const queryParams = new URLSearchParams()

    if (filters) {
      if (filters.category) queryParams.append("category", filters.category)
      if (filters.featured !== undefined) queryParams.append("featured", String(filters.featured))
      if (filters.status) queryParams.append("status", filters.status)
      if (filters.search) queryParams.append("search", filters.search)
      if (filters.page) queryParams.append("page", String(filters.page))
      if (filters.full_details) queryParams.append("full_details", String(filters.full_details))
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

    return apiRequest<{
      count: number
      next: string | null
      previous: string | null
      results: Event[]
    }>(`/events/events/${queryString}`)
  },

  // Get a single event by ID
  getById: async (id: number | string) => {
    // Ensure id is a valid number
    if (!id || isNaN(Number(id))) {
      throw new Error("Invalid event ID")
    }
    return apiRequest<Event>(`/events/events/${id}/`)
  },

  // Create a new event
  create: async (eventData: Partial<Event>) => {
    return apiRequest<Event>("/events/events/", "POST", eventData)
  },

  // Update an event
  update: async (id: number | string, eventData: Partial<Event>) => {
    return apiRequest<Event>(`/events/events/${id}/`, "PUT", eventData)
  },

  // Delete an event
  delete: async (id: number | string) => {
    return apiRequest<void>(`/events/events/${id}/`, "DELETE")
  },
}

// Format event data for API submission
export function formatEventData(data: any): Partial<Event> {
  // Create a clean object with only the fields we want to send
  const formattedData: Partial<Event> = {
    title: data.title,
    description: data.description,
    category: data.category?.toLowerCase(),
    location: data.location,
    address: data.address,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    start_date: data.start_date,
    end_date: data.end_date,
    images: data.images,
    capacity: Number(data.capacity || 0),
    price: data.price,
    featured: Boolean(data.featured),
    status: data.status,
  }

  // Remove any undefined or null values to avoid API issues
  Object.keys(formattedData).forEach((key) => {
    if (
      formattedData[key as keyof Partial<Event>] === undefined ||
      formattedData[key as keyof Partial<Event>] === null
    ) {
      delete formattedData[key as keyof Partial<Event>]
    }
  })

  return formattedData
}
