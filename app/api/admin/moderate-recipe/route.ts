import { NextResponse } from "next/server"
import { sql, initializeDatabase } from "@/lib/neon"

export async function POST(request: Request) {
  try {
    await initializeDatabase()

    const { recipeId, status, notes } = await request.json()

    if (!recipeId || !status) {
      return NextResponse.json({ success: false, error: "Recipe ID and status are required" }, { status: 400 })
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, error: "Status must be 'approved' or 'rejected'" }, { status: 400 })
    }

    // For testing purposes, we'll allow moderation without strict auth
    // In production, you'd want to check user permissions here

    // Update recipe status
    await sql`
      UPDATE recipes 
      SET moderation_status = ${status}, 
          is_published = ${status === "approved"},
          updated_at = NOW()
      WHERE id = ${recipeId}
    `

    // Get the updated recipe
    const updatedRecipe = await sql`
      SELECT r.*, u.username as author_username
      FROM recipes r
      JOIN users u ON r.author_id = u.id
      WHERE r.id = ${recipeId}
    `

    return NextResponse.json({
      success: true,
      message: `Recipe ${status} successfully`,
      recipe: updatedRecipe[0],
    })
  } catch (error) {
    console.error("Failed to moderate recipe:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to moderate recipe",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
