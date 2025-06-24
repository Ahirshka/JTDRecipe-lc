"use server"

import { sql, initializeDatabase } from "./neon"
import { getCurrentUser } from "./auth-actions"
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
  is_published: boolean
  created_at: string
  updated_at: string
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

// Get all approved recipes
export async function getApprovedRecipes(): Promise<Recipe[]> {
  try {
    // Ensure database is initialized
    await initializeDatabase()

    const recipes = await sql`
      SELECT r.*, u.username as author_username
      FROM recipes r
      JOIN users u ON r.author_id = u.id
      WHERE r.moderation_status = 'approved' AND r.is_published = true
      ORDER BY r.created_at DESC
    `

    return recipes.map((row: any) => ({
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
      rating: Number.parseFloat(row.rating) || 0,
      review_count: row.review_count || 0,
      view_count: row.view_count || 0,
      moderation_status: row.moderation_status,
      is_published: row.is_published,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  } catch (error) {
    console.error("Get approved recipes error:", error)
    return []
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const result = await sql<Recipe>`SELECT * FROM recipes`
    return result.rows
  } catch (error) {
    console.error("Database error:", error)
    return []
  }
}

// Get recipe by ID with full details
export async function getRecipeById(id: string) {
  try {
    await initializeDatabase()

    // Get recipe
    const recipes = await sql`
      SELECT r.*, u.username as author_username
      FROM recipes r
      JOIN users u ON r.author_id = u.id
      WHERE r.id = ${id}
    `

    if (recipes.length === 0) {
      return null
    }

    const recipe = recipes[0]

    // Get ingredients
    const ingredients = await sql`
      SELECT ingredient, amount, unit
      FROM recipe_ingredients
      WHERE recipe_id = ${id}
      ORDER BY order_index
    `

    // Get instructions
    const instructions = await sql`
      SELECT instruction, step_number
      FROM recipe_instructions
      WHERE recipe_id = ${id}
      ORDER BY step_number
    `

    // Get tags
    const tags = await sql`
      SELECT tag
      FROM recipe_tags
      WHERE recipe_id = ${id}
    `

    return {
      ...recipe,
      ingredients: ingredients,
      instructions: instructions,
      tags: tags.map((row: any) => row.tag),
      is_published: recipe.is_published,
      rating: Number.parseFloat(recipe.rating) || 0,
    }
  } catch (error) {
    console.error("Get recipe by ID error:", error)
    return null
  }
}

// Create a new recipe
export async function createRecipe(
  recipeData: CreateRecipeData,
): Promise<{ success: boolean; error?: string; recipeId?: string }> {
  try {
    await initializeDatabase()

    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Authentication required" }
    }

    // Insert recipe
    const newRecipe = await sql`
      INSERT INTO recipes (
        title, description, author_id, category, difficulty,
        prep_time_minutes, cook_time_minutes, servings, image_url,
        moderation_status, is_published
      ) VALUES (
        ${recipeData.title}, ${recipeData.description || null}, ${user.id}, 
        ${recipeData.category}, ${recipeData.difficulty}, ${recipeData.prep_time_minutes},
        ${recipeData.cook_time_minutes}, ${recipeData.servings}, ${recipeData.image_url || null},
        'pending', false
      )
      RETURNING id
    `

    const recipeId = newRecipe[0].id

    // Add ingredients
    for (let i = 0; i < recipeData.ingredients.length; i++) {
      const ingredient = recipeData.ingredients[i]
      await sql`
        INSERT INTO recipe_ingredients (recipe_id, ingredient, amount, unit, order_index)
        VALUES (${recipeId}, ${ingredient.ingredient}, ${ingredient.amount}, ${ingredient.unit}, ${i})
      `
    }

    // Add instructions
    for (const instruction of recipeData.instructions) {
      await sql`
        INSERT INTO recipe_instructions (recipe_id, instruction, step_number)
        VALUES (${recipeId}, ${instruction.instruction}, ${instruction.step_number})
      `
    }

    // Add tags
    for (const tag of recipeData.tags) {
      await sql`
        INSERT INTO recipe_tags (recipe_id, tag)
        VALUES (${recipeId}, ${tag})
      `
    }

    revalidatePath("/")

    return { success: true, recipeId }
  } catch (error) {
    console.error("Create recipe error:", error)
    return { success: false, error: "Failed to create recipe" }
  }
}

export async function updateRecipe(id: string, recipe: Recipe): Promise<void> {
  try {
    await sql`
      UPDATE recipes
      SET title = ${recipe.title}, ingredients = ${recipe.ingredients}, instructions = ${recipe.instructions}, image_url = ${recipe.image_url}, approved = ${recipe.approved}
      WHERE id = ${id}
    `
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to update recipe.")
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  try {
    await sql`DELETE FROM recipes WHERE id = ${id}`
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to delete recipe.")
  }
}

export async function approveRecipe(id: string): Promise<void> {
  try {
    await sql`UPDATE recipes SET approved = TRUE WHERE id = ${id}`
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to approve recipe.")
  }
}

// Get pending recipes for moderation
export async function getPendingRecipes(): Promise<Recipe[]> {
  try {
    await initializeDatabase()

    const recipes = await sql`
      SELECT r.*, u.username as author_username
      FROM recipes r
      JOIN users u ON r.author_id = u.id
      WHERE r.moderation_status = 'pending'
      ORDER BY r.created_at ASC
    `

    return recipes.map((row: any) => ({
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
      rating: Number.parseFloat(row.rating) || 0,
      review_count: row.review_count || 0,
      view_count: row.view_count || 0,
      moderation_status: row.moderation_status,
      is_published: row.is_published,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  } catch (error) {
    console.error("Get pending recipes error:", error)
    return []
  }
}
