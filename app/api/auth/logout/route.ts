import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Clear the authentication cookie
  (await cookies()).delete("accessToken")

  return NextResponse.json({ success: true })
}
