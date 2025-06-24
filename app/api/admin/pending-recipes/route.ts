import { type NextRequest, NextResponse } from "next/server"
import { getPendingRecipes } from "@/lib/recipe-actions"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || !["moderator", "admin", "owner"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const recipes = await getPendingRecipes()
    return NextResponse.json({ recipes })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to fetch pending recipes" }, { status: 500 })
  }
}
