import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// This endpoint will help with debugging authentication issues
export async function GET() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const accessToken = cookieStore.get("accessToken")

  return NextResponse.json({
    isAuthenticated: !!accessToken,
    accessToken: accessToken
      ? {
          name: accessToken.name,
          value: accessToken.value.substring(0, 10) + "...",
          expires: accessToken.expires,
          path: accessToken.path,
          domain: accessToken.domain,
          httpOnly: accessToken.httpOnly,
          secure: accessToken.secure,
          sameSite: accessToken.sameSite,
        }
      : null,
    allCookies: allCookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.name === "accessToken" ? cookie.value.substring(0, 10) + "..." : "[hidden]",
      expires: cookie.expires,
      path: cookie.path,
    })),
    timestamp: new Date().toISOString(),
  })
}
