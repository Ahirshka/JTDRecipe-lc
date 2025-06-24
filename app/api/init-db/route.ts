import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/neon"

export async function POST() {
  try {
    await initializeDatabase()
    return NextResponse.json({
      success: true,
      message: "Database initialized successfully with sample data",
    })
  } catch (error) {
    console.error("Database initialization failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST() // Allow GET requests too for easier testing
}
