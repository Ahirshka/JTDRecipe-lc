import { type NextRequest, NextResponse } from "next/server"
import { logoutUser } from "@/lib/auth-actions"

export async function POST(request: NextRequest) {
  try {
    await logoutUser()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
