import { NextResponse } from "next/server"

// This is a client-side utility, not a server endpoint
export async function GET() {
  return NextResponse.json({
    message: "This is a debugging utility for client-side localStorage",
    instructions: "Use the following code in your browser console to check localStorage:",
    code: `
    // Check authentication data
    console.log({
      accessToken: localStorage.getItem("accessToken") ? "Present" : "Not present",
      refreshToken: localStorage.getItem("refreshToken") ? "Present" : "Not present",
      user: JSON.parse(localStorage.getItem("user") || "null"),
    });
    `,
  })
}
