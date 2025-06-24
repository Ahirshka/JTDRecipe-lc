import { type NextRequest, NextResponse } from "next/server"
import { getApprovedRecipes } from "@/lib/recipe-actions"

export async function GET(request: NextRequest) {
  try {
    const recipes = await getApprovedRecipes()
    return NextResponse.json(recipes)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json([], { status: 200 }) // Return empty array instead of error
  }
}
