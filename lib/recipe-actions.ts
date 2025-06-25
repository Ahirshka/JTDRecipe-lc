"use server"

import { revalidatePath } from "next/cache"

export interface Recipe {
  id: string
  title: string
  description?: string
  author_id: string
  author_username: string
  category: string
  difficulty: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url?: string
  rating: number
  review_count: number
  view_count: number
  moderation_status: string
  moderation_notes?: string
  is_published: boolean
  created_at: string
  updated_at: string
  ingredients?: Array<{ ingredient: string; amount: string; unit: string }>
  instructions?: Array<{ instruction: string; step_number: number }>
  tags?: string[]
}

export interface CreateRecipeData {
  title: string
  description?: string
  category: string
  difficulty: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url?: string
  ingredients: Array<{ ingredient: string; amount: string; unit: string }>
  instructions: Array<{ instruction: string; step_number: number }>
  tags: string[]
}

// Get all approved and published recipes for the website
export async function getApprovedRecipes(): Promise<Recipe[]> {
  try {
    // Return mock data for now to prevent errors
    const mockRecipes: Recipe[] = [
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
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    return mockRecipes
  } catch (error) {
    console.error("Get approved recipes error:", error)
    return []
  }
}

// Get pending recipes for moderation
export async function getPendingRecipes(): Promise<Recipe[]> {
  try {
    // Return empty array for now
    return []
  } catch (error) {
    console.error("Get pending recipes error:", error)
    return []
  }
}

// Get recipe by ID with full details
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    // Return mock recipe for testing
    const mockRecipe: Recipe = {
      id: id,
      title: "Sample Recipe",
      description: "This is a sample recipe for testing",
      author_id: "1",
      author_username: "TestUser",
      category: "Main Dishes",
      difficulty: "Easy",
      prep_time_minutes: 15,
      cook_time_minutes: 30,
      servings: 4,
      image_url: "/placeholder.svg?height=200&width=300&text=Sample+Recipe",
      rating: 4.5,
      review_count: 10,
      view_count: 100,
      moderation_status: "approved",
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ingredients: [
        { ingredient: "Sample ingredient 1", amount: "1", unit: "cup" },
        { ingredient: "Sample ingredient 2", amount: "2", unit: "tbsp" },
      ],
      instructions: [
        { instruction: "Step 1: Do something", step_number: 1 },
        { instruction: "Step 2: Do something else", step_number: 2 },
      ],
      tags: ["easy", "quick", "delicious"],
    }

    return mockRecipe
  } catch (error) {
    console.error("Get recipe by ID error:", error)
    return null
  }
}

// Moderate recipe (approve/reject)
export async function moderateRecipe(
  recipeId: string,
  status: "approved" | "rejected",
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Mock implementation for now
    console.log(`Moderating recipe ${recipeId} with status ${status}`)

    revalidatePath("/")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Moderate recipe error:", error)
    return { success: false, error: "Failed to moderate recipe" }
  }
}

// Create a new recipe
export async function createRecipe(
  recipeData: CreateRecipeData,
): Promise<{ success: boolean; error?: string; recipeId?: string }> {
  try {
    // Mock implementation for now
    const recipeId = Date.now().toString()
    console.log("Creating recipe:", recipeData.title)

    revalidatePath("/")
    revalidatePath("/admin")

    return { success: true, recipeId }
  } catch (error) {
    console.error("Create recipe error:", error)
    return { success: false, error: "Failed to create recipe" }
  }
}

// Update recipe
export async function updateRecipe(
  id: string,
  recipeData: Partial<CreateRecipeData>,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Updating recipe:", id)

    revalidatePath("/")
    revalidatePath(`/recipe/${id}`)

    return { success: true }
  } catch (error) {
    console.error("Update recipe error:", error)
    return { success: false, error: "Failed to update recipe" }
  }
}

// Delete recipe
export async function deleteRecipe(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Deleting recipe:", id)

    revalidatePath("/")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Delete recipe error:", error)
    return { success: false, error: "Failed to delete recipe" }
  }
}

// Get recipes by category
export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  try {
    const allRecipes = await getApprovedRecipes()
    return allRecipes.filter((recipe) => recipe.category === category)
  } catch (error) {
    console.error("Get recipes by category error:", error)
    return []
  }
}

// Search recipes
export async function searchRecipes(query: string): Promise<Recipe[]> {
  try {
    const allRecipes = await getApprovedRecipes()
    const lowercaseQuery = query.toLowerCase()

    return allRecipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(lowercaseQuery) ||
        recipe.description?.toLowerCase().includes(lowercaseQuery) ||
        recipe.category.toLowerCase().includes(lowercaseQuery),
    )
  } catch (error) {
    console.error("Search recipes error:", error)
    return []
  }
}
