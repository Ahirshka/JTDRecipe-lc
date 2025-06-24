import { NextResponse } from "next/server"
import { sql, initializeDatabase } from "@/lib/neon"

export async function GET() {
  try {
    await initializeDatabase()

    const pendingRecipes = await sql`
      SELECT r.*, u.username as author_username
      FROM recipes r
      JOIN users u ON r.author_id = u.id
      WHERE r.moderation_status = 'pending'
      ORDER BY r.created_at ASC
    `

    const formattedRecipes = pendingRecipes.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      author_id: row.author_id,
      author_username: row.author_username,
      category: row.category,
      difficulty: row.difficulty,
      prep_time_minutes: row.prep_time_minutes || 0,
      cook_time_minutes: row.cook_time_minutes || 0,
      servings: row.servings || 1,
      image_url: row.image_url,
      moderation_status: row.moderation_status,
      created_at: row.created_at,
    }))

    return NextResponse.json({
      success: true,
      recipes: formattedRecipes,
      count: formattedRecipes.length,
    })
  } catch (error) {
    console.error("Failed to get pending recipes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get pending recipes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
