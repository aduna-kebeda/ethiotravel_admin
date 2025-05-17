import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Clear the authentication cookie
    (await cookies()).delete("accessToken")

    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json({ success: false, message: "Failed to logout" }, { status: 500 })
  }
}
