import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Return mock data for now to prevent 500 errors
    const mockRecipes = [
      {
        id: "1",
        title: "Classic Chocolate Chip Cookies",
        description: "Perfectly chewy chocolate chip cookies that everyone loves",
        author_id: "1",
        author_username: "ChefMike",
        category: "Desserts",
        difficulty: "Easy",
        prep_time_minutes: 15,
        cook_time_minutes: 12,
        servings: 24,
        image_url: "/placeholder.svg?height=200&width=300&text=Chocolate+Chip+Cookies",
        rating: 4.8,
        review_count: 156,
        view_count: 2340,
        moderation_status: "approved",
        is_published: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Homemade Pizza Dough",
        description: "Easy pizza dough recipe that works every time",
        author_id: "2",
        author_username: "PizzaLover",
        category: "Main Dishes",
        difficulty: "Medium",
        prep_time_minutes: 20,
        cook_time_minutes: 15,
        servings: 4,
        image_url: "/placeholder.svg?height=200&width=300&text=Pizza+Dough",
        rating: 4.6,
        review_count: 89,
        view_count: 1890,
        moderation_status: "approved",
        is_published: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updated_at: new Date().toISOString(),
      },
      {
        id: "3",
        title: "Fresh Garden Salad",
        description: "Light and refreshing salad with seasonal vegetables",
        author_id: "3",
        author_username: "HealthyEats",
        category: "Salads",
        difficulty: "Easy",
        prep_time_minutes: 10,
        cook_time_minutes: 0,
        servings: 2,
        image_url: "/placeholder.svg?height=200&width=300&text=Garden+Salad",
        rating: 4.3,
        review_count: 45,
        view_count: 890,
        moderation_status: "approved",
        is_published: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updated_at: new Date().toISOString(),
      },
      {
        id: "4",
        title: "Beef Stir Fry",
        description: "Quick and delicious beef stir fry with vegetables",
        author_id: "4",
        author_username: "WokMaster",
        category: "Main Dishes",
        difficulty: "Medium",
        prep_time_minutes: 15,
        cook_time_minutes: 10,
        servings: 4,
        image_url: "/placeholder.svg?height=200&width=300&text=Beef+Stir+Fry",
        rating: 4.7,
        review_count: 123,
        view_count: 1560,
        moderation_status: "approved",
        is_published: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updated_at: new Date().toISOString(),
      },
      {
        id: "5",
        title: "Banana Bread",
        description: "Moist and flavorful banana bread perfect for breakfast",
        author_id: "5",
        author_username: "BakingQueen",
        category: "Desserts",
        difficulty: "Easy",
        prep_time_minutes: 15,
        cook_time_minutes: 60,
        servings: 8,
        image_url: "/placeholder.svg?height=200&width=300&text=Banana+Bread",
        rating: 4.9,
        review_count: 234,
        view_count: 3450,
        moderation_status: "approved",
        is_published: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        updated_at: new Date().toISOString(),
      },
      {
        id: "6",
        title: "Chicken Caesar Salad",
        description: "Classic Caesar salad with grilled chicken",
        author_id: "6",
        author_username: "SaladChef",
        category: "Salads",
        difficulty: "Medium",
        prep_time_minutes: 20,
        cook_time_minutes: 15,
        servings: 2,
        image_url: "/placeholder.svg?height=200&width=300&text=Caesar+Salad",
        rating: 4.5,
        review_count: 67,
        view_count: 1230,
        moderation_status: "approved",
        is_published: true,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        updated_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json(mockRecipes)
  } catch (error) {
    console.error("API error:", error)
    // Return empty array instead of error to prevent homepage crash
    return NextResponse.json([])
  }
}
