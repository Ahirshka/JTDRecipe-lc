import { type NextRequest, NextResponse } from "next/server"
import { moderateRecipe } from "@/lib/recipe-actions"
import { getCurrentUser } from "@/lib/auth-actions"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || !["moderator", "admin", "owner"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { recipeId, status, notes } = await request.json()

    if (!recipeId || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const result = await moderateRecipe(recipeId, status, notes)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to moderate recipe" }, { status: 500 })
  }
}
