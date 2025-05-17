"use client"


import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id?: string
  username: string
  email: string
  first_name: string
  last_name: string
  role?: string
  status?: string
  email_verified?: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

type RegisterData = {
  username: string
  email: string
  password: string
  password2: string
  first_name: string
  last_name: string
  role: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have a cookie-based session
        const authCheckResponse = await fetch("/api/auth", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const authCheckData = await authCheckResponse.json()
        console.log("Auth check response:", authCheckData)

        if (authCheckData.isAuthenticated) {
          // If we have a valid cookie but no user data, try to get user data
          const userData = localStorage.getItem("user")
          if (userData) {
            setUser(JSON.parse(userData))
            setIsAuthenticated(true)
          } else {
            // If we have a cookie but no user data, we need to fetch the user data
            // This would require an API endpoint to get the current user
            console.log("Cookie exists but no user data found")
            // You would typically call an API endpoint here to get the user data
          }
        } else {
          // No valid cookie, check localStorage as fallback
          const accessToken = localStorage.getItem("accessToken")
          const userData = localStorage.getItem("user")

          if (accessToken && userData) {
            // Set the cookie from localStorage token
            await fetch("/api/auth", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token: accessToken }),
            })

            setUser(JSON.parse(userData))
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error("Authentication check error:", error)
        // Clear any potentially invalid auth data
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Update the login function to ensure proper authentication state and cookie setting
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log("Attempting login for:", email)
      const response = await fetch("https://ai-driven-travel.onrender.com/api/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log("Login response status:", response.status)

      if (!response.ok) {
        console.error("Login failed:", data)
        setIsLoading(false)
        return { success: false, message: data.message || "Login failed" }
      }

      // Store tokens and user data
      localStorage.setItem("accessToken", data.data.access_token)
      localStorage.setItem("refreshToken", data.data.refresh_token)
      localStorage.setItem("user", JSON.stringify(data.data.user))

      // Set the token as an HTTP-only cookie for middleware
      const cookieResponse = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: data.data.access_token }),
      })

      if (!cookieResponse.ok) {
        console.error("Failed to set auth cookie:", await cookieResponse.json())
      } else {
        console.log("Auth cookie set successfully")
      }

      // Set authentication state
      setUser(data.data.user)
      setIsAuthenticated(true)

      // Add a delay to ensure state is updated before the middleware checks
      await new Promise((resolve) => setTimeout(resolve, 500))

      setIsLoading(false)
      return { success: true, message: "Login successful" }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return { success: false, message: "An error occurred during login" }
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await fetch("https://ai-driven-travel.onrender.com/api/users/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        setIsLoading(false)
        return { success: false, message: data.message || "Registration failed" }
      }

      // Store tokens and user data
      localStorage.setItem("accessToken", data.data.access_token)
      localStorage.setItem("refreshToken", data.data.refresh_token)
      localStorage.setItem("user", JSON.stringify(data.data.user))
      localStorage.setItem("pendingVerification", data.data.user.email)

      setUser(data.data.user)
      setIsAuthenticated(true)
      setIsLoading(false)
      return { success: true, message: data.message || "Registration successful" }
    } catch (error) {
      console.error("Registration error:", error)
      setIsLoading(false)
      return { success: false, message: "An error occurred during registration" }
    }
  }

  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("https://ai-driven-travel.onrender.com/api/users/verify_email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        setIsLoading(false)
        return { success: false, message: data.message || "Verification failed" }
      }

      // Update user verification status if we have a user
      if (user && user.email === email) {
        const updatedUser = { ...user, email_verified: true }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      setIsLoading(false)
      return { success: true, message: data.message || "Email verification successful" }
    } catch (error) {
      console.error("Verification error:", error)
      setIsLoading(false)
      return { success: false, message: "An error occurred during email verification" }
    }
  }

  // Updated logout function to properly implement the API logout endpoint
  const logout = async () => {
    setIsLoading(true)
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      const accessToken = localStorage.getItem("accessToken")

      if (refreshToken && accessToken) {
        console.log("Attempting to logout with refresh token")

        // Call the backend logout API endpoint with proper headers and body
        const logoutResponse = await fetch("https://ai-driven-travel.onrender.com/api/users/logout/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        })

        if (logoutResponse.ok) {
          const logoutData = await logoutResponse.json()
          console.log("Logout successful:", logoutData.message)
        } else {
          console.error("Backend logout failed:", await logoutResponse.text())
        }
      } else {
        console.warn("No refresh token or access token found for logout")
      }

      // Clear the HTTP-only cookie regardless of API response
      const cookieLogoutResponse = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (cookieLogoutResponse.ok) {
        console.log("Cookie cleared successfully")
      } else {
        console.error("Failed to clear auth cookie:", await cookieLogoutResponse.text())
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear local storage and reset state regardless of API call success
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("pendingVerification")

      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)

      // Navigate to login page
      router.push("/login")
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, verifyEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthContext }
