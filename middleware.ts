import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // If path is empty or root, just allow
  if (!path || path === "/") {
    return NextResponse.next()
  }

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/register" || path === "/verify-email"

  // Check if user is authenticated
  const token = request.cookies.get("accessToken")?.value || ""

  // Add console log for debugging
  console.log(`Middleware checking path: ${path}, isPublicPath: ${isPublicPath}, hasToken: ${!!token}`)

  // If the path is public and user is authenticated, redirect to dashboard
  if (isPublicPath && token) {
    console.log("User is authenticated and trying to access public path, redirecting to dashboard")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If the path is not public and user is not authenticated, redirect to login
  if (!isPublicPath && !token) {
    console.log("User is not authenticated and trying to access protected path, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Allow the request to proceed
  console.log("Middleware allowing request to proceed")
  return NextResponse.next()
}

// Only match actual app routes, not the root "/"
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/packages/:path*",
    "/events/:path*",
    "/destinations/:path*",
    "/business-verification/:path*",
    "/blog/:path*",
    "/users/:path*",
    "/reviews/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/verify-email",
  ],
}