// Database interface for recipe management
export interface DatabaseRecipe {
  id: string
  title: string
  description: string | null
  author_id: string
  category: string
  difficulty: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string | null
  rating: number
  review_count: number
  view_count: number
  is_published: boolean
  created_at: string
  updated_at: string
  // Joined data
  author_username?: string
  ingredients?: string[]
  instructions?: string[]
  tags?: string[]
}

export interface DatabaseUser {
  id: string
  username: string
  email: string
  password?: string
  avatar?: string
  provider: string
  social_id?: string
  role: string
  status: string
  is_verified: boolean
  is_suspended: boolean
  suspension_reason?: string
  suspension_expires_at?: string
  warning_count: number
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface DatabaseRating {
  id: string
  user_id: string
  recipe_id: string
  rating: number
  review?: string
  created_at: string
  updated_at: string
  username?: string
}

// Database connection (using Web SQL or SQLite in browser)
class RecipeDatabase {
  private db: any = null

  constructor() {
    if (typeof window !== "undefined") {
      // Initialize database connection
      this.initDatabase()
    }
  }

  private initDatabase() {
    // For demo purposes, we'll use localStorage as a simple database
    // In production, this would connect to a real database
    if (!localStorage.getItem("db_initialized")) {
      this.createTables()
      this.seedData()
      localStorage.setItem("db_initialized", "true")
    }
  }

  private createTables() {
    // Tables are created via SQL scripts
    console.log("Database tables created")
  }

  private seedData() {
    // Data is seeded via SQL scripts
    console.log("Database seeded with initial data")
  }

  // Recipe operations
  async getAllRecipes(): Promise<DatabaseRecipe[]> {
    const recipes = JSON.parse(localStorage.getItem("db_recipes") || "[]")
    const users = JSON.parse(localStorage.getItem("db_users") || "[]")

    return recipes.map((recipe: any) => {
      const author = users.find((u: any) => u.id === recipe.author_id)
      return {
        ...recipe,
        author_username: author?.username || "Unknown",
        ingredients: this.getRecipeIngredients(recipe.id),
        instructions: this.getRecipeInstructions(recipe.id),
        tags: this.getRecipeTags(recipe.id),
      }
    })
  }

  async getRecipeById(id: string): Promise<DatabaseRecipe | null> {
    const recipes = await this.getAllRecipes()
    return recipes.find((recipe) => recipe.id === id) || null
  }

  async getRecipesByAuthorId(authorId: string): Promise<DatabaseRecipe[]> {
    const recipes = await this.getAllRecipes()
    return recipes.filter((recipe) => recipe.author_id === authorId)
  }

  async createRecipe(recipeData: {
    title: string
    description?: string
    author_id: string
    category: string
    difficulty: string
    prep_time_minutes: number
    cook_time_minutes: number
    servings: number
    image_url?: string
    ingredients: string[]
    instructions: string[]
    tags: string[]
  }): Promise<DatabaseRecipe> {
    const recipes = JSON.parse(localStorage.getItem("db_recipes") || "[]")
    const newRecipe = {
      id: Date.now().toString(),
      title: recipeData.title,
      description: recipeData.description || null,
      author_id: recipeData.author_id,
      category: recipeData.category,
      difficulty: recipeData.difficulty,
      prep_time_minutes: recipeData.prep_time_minutes,
      cook_time_minutes: recipeData.cook_time_minutes,
      servings: recipeData.servings,
      image_url: recipeData.image_url || null,
      rating: 0,
      review_count: 0,
      view_count: 0,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    recipes.push(newRecipe)
    localStorage.setItem("db_recipes", JSON.stringify(recipes))

    // Save ingredients
    this.saveRecipeIngredients(newRecipe.id, recipeData.ingredients)

    // Save instructions
    this.saveRecipeInstructions(newRecipe.id, recipeData.instructions)

    // Save tags
    this.saveRecipeTags(newRecipe.id, recipeData.tags)

    return (await this.getRecipeById(newRecipe.id)) as DatabaseRecipe
  }

  async updateRecipeViews(recipeId: string): Promise<void> {
    const recipes = JSON.parse(localStorage.getItem("db_recipes") || "[]")
    const recipeIndex = recipes.findIndex((r: any) => r.id === recipeId)

    if (recipeIndex !== -1) {
      recipes[recipeIndex].view_count += 1
      recipes[recipeIndex].updated_at = new Date().toISOString()
      localStorage.setItem("db_recipes", JSON.stringify(recipes))
    }
  }

  // User operations
  async getUserById(id: string): Promise<DatabaseUser | null> {
    const users = JSON.parse(localStorage.getItem("db_users") || "[]")
    return users.find((user: any) => user.id === id) || null
  }

  async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    const users = JSON.parse(localStorage.getItem("db_users") || "[]")
    return users.find((user: any) => user.email === email) || null
  }

  async createUser(userData: Omit<DatabaseUser, "id" | "created_at" | "updated_at">): Promise<DatabaseUser> {
    const users = JSON.parse(localStorage.getItem("db_users") || "[]")
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("db_users", JSON.stringify(users))
    return newUser
  }

  // Rating operations
  async getUserRating(userId: string, recipeId: string): Promise<number | null> {
    const ratings = JSON.parse(localStorage.getItem("db_ratings") || "[]")
    const rating = ratings.find((r: any) => r.user_id === userId && r.recipe_id === recipeId)
    return rating ? rating.rating : null
  }

  async saveUserRating(userId: string, recipeId: string, rating: number, review?: string): Promise<void> {
    const ratings = JSON.parse(localStorage.getItem("db_ratings") || "[]")
    const existingIndex = ratings.findIndex((r: any) => r.user_id === userId && r.recipe_id === recipeId)

    const ratingData = {
      id: existingIndex >= 0 ? ratings[existingIndex].id : Date.now().toString(),
      user_id: userId,
      recipe_id: recipeId,
      rating,
      review: review || null,
      created_at: existingIndex >= 0 ? ratings[existingIndex].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      ratings[existingIndex] = ratingData
    } else {
      ratings.push(ratingData)
    }

    localStorage.setItem("db_ratings", JSON.stringify(ratings))
    await this.updateRecipeRating(recipeId)
  }

  // Favorite operations
  async getUserFavorites(userId: string): Promise<string[]> {
    const favorites = JSON.parse(localStorage.getItem("db_favorites") || "[]")
    return favorites.filter((f: any) => f.user_id === userId).map((f: any) => f.recipe_id)
  }

  async toggleUserFavorite(userId: string, recipeId: string): Promise<boolean> {
    const favorites = JSON.parse(localStorage.getItem("db_favorites") || "[]")
    const existingIndex = favorites.findIndex((f: any) => f.user_id === userId && f.recipe_id === recipeId)

    if (existingIndex >= 0) {
      // Remove favorite
      favorites.splice(existingIndex, 1)
      localStorage.setItem("db_favorites", JSON.stringify(favorites))
      return false
    } else {
      // Add favorite
      favorites.push({
        id: Date.now().toString(),
        user_id: userId,
        recipe_id: recipeId,
        created_at: new Date().toISOString(),
      })
      localStorage.setItem("db_favorites", JSON.stringify(favorites))
      return true
    }
  }

  // Helper methods
  private getRecipeIngredients(recipeId: string): string[] {
    const ingredients = JSON.parse(localStorage.getItem("db_ingredients") || "[]")
    return ingredients
      .filter((ing: any) => ing.recipe_id === recipeId)
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((ing: any) => ing.ingredient)
  }

  private getRecipeInstructions(recipeId: string): string[] {
    const instructions = JSON.parse(localStorage.getItem("db_instructions") || "[]")
    return instructions
      .filter((inst: any) => inst.recipe_id === recipeId)
      .sort((a: any, b: any) => a.step_number - b.step_number)
      .map((inst: any) => inst.instruction)
  }

  private getRecipeTags(recipeId: string): string[] {
    const tags = JSON.parse(localStorage.getItem("db_tags") || "[]")
    return tags.filter((tag: any) => tag.recipe_id === recipeId).map((tag: any) => tag.tag)
  }

  private saveRecipeIngredients(recipeId: string, ingredients: string[]): void {
    const allIngredients = JSON.parse(localStorage.getItem("db_ingredients") || "[]")

    ingredients.forEach((ingredient, index) => {
      allIngredients.push({
        id: `${recipeId}_ing_${index}`,
        recipe_id: recipeId,
        ingredient,
        order_index: index + 1,
        created_at: new Date().toISOString(),
      })
    })

    localStorage.setItem("db_ingredients", JSON.stringify(allIngredients))
  }

  private saveRecipeInstructions(recipeId: string, instructions: string[]): void {
    const allInstructions = JSON.parse(localStorage.getItem("db_instructions") || "[]")

    instructions.forEach((instruction, index) => {
      allInstructions.push({
        id: `${recipeId}_inst_${index}`,
        recipe_id: recipeId,
        instruction,
        step_number: index + 1,
        created_at: new Date().toISOString(),
      })
    })

    localStorage.setItem("db_instructions", JSON.stringify(allInstructions))
  }

  private saveRecipeTags(recipeId: string, tags: string[]): void {
    const allTags = JSON.parse(localStorage.getItem("db_tags") || "[]")

    tags.forEach((tag) => {
      allTags.push({
        id: `${recipeId}_tag_${tag}`,
        recipe_id: recipeId,
        tag,
        created_at: new Date().toISOString(),
      })
    })

    localStorage.setItem("db_tags", JSON.stringify(allTags))
  }

  private async updateRecipeRating(recipeId: string): Promise<void> {
    const ratings = JSON.parse(localStorage.getItem("db_ratings") || "[]")
    const recipeRatings = ratings.filter((r: any) => r.recipe_id === recipeId)

    if (recipeRatings.length > 0) {
      const avgRating = recipeRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / recipeRatings.length

      const recipes = JSON.parse(localStorage.getItem("db_recipes") || "[]")
      const recipeIndex = recipes.findIndex((r: any) => r.id === recipeId)

      if (recipeIndex !== -1) {
        recipes[recipeIndex].rating = Math.round(avgRating * 10) / 10
        recipes[recipeIndex].review_count = recipeRatings.length
        recipes[recipeIndex].updated_at = new Date().toISOString()
        localStorage.setItem("db_recipes", JSON.stringify(recipes))
      }
    }
  }
}

// Export singleton instance
export const recipeDB = new RecipeDatabase()
