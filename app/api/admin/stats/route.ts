import { NextResponse } from "next/server"
import { sql, initializeDatabase } from "@/lib/neon"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET() {
  try {
    await initializeDatabase()

    const user = await getCurrentUser()
    if (!user || !["admin", "moderator", "owner"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get various stats
    const [totalUsers, totalRecipes, pendingRecipes, approvedRecipes, rejectedRecipes, totalViews] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users WHERE status = 'active'`,
      sql`SELECT COUNT(*) as count FROM recipes`,
      sql`SELECT COUNT(*) as count FROM recipes WHERE moderation_status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM recipes WHERE moderation_status = 'approved'`,
      sql`SELECT COUNT(*) as count FROM recipes WHERE moderation_status = 'rejected'`,
      sql`SELECT SUM(view_count) as total FROM recipes WHERE moderation_status = 'approved'`,
    ])

    // Get recent activity
    const recentRecipes = await sql`
      SELECT r.title, r.created_at, u.username, r.moderation_status
      FROM recipes r
      JOIN users u ON r.author_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `

    return NextResponse.json({
      stats: {
        totalUsers: Number(totalUsers[0].count),
        totalRecipes: Number(totalRecipes[0].count),
        pendingRecipes: Number(pendingRecipes[0].count),
        approvedRecipes: Number(approvedRecipes[0].count),
        rejectedRecipes: Number(rejectedRecipes[0].count),
        totalViews: Number(totalViews[0].total) || 0,
      },
      recentActivity: recentRecipes,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
