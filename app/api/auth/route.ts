import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// This endpoint will help us debug the authentication state
export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")

  return NextResponse.json({
    isAuthenticated: !!accessToken,
    token: accessToken ? "Present" : "Not present",
    tokenValue: accessToken ? accessToken.value.substring(0, 10) + "..." : "None",
  })
}

// This endpoint will set the authentication cookie when login is successful
export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 400 })
    }

    // Set the token as an HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: "accessToken",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.json({
      success: true,
      message: "Cookie set successfully",
      debug: {
        tokenLength: token.length,
        tokenStart: token.substring(0, 10) + "...",
      },
    })
  } catch (error) {
    console.error("Error setting auth cookie:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to set auth cookie",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
