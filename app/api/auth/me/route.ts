import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Auth API error:", error)
    return NextResponse.json({ user: null })
  }
}
