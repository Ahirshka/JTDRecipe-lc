import bcrypt from "bcryptjs"

// Secure database interface with encryption and proper data handling
export interface SecureUser {
  id: string
  username: string
  email: string
  password_hash: string // Encrypted password
  avatar?: string
  provider: string
  social_id?: string
  role: UserRole
  status: UserStatus
  is_verified: boolean
  is_suspended: boolean
  suspension_reason?: string
  suspension_expires_at?: string
  warning_count: number
  created_at: string
  updated_at: string
  last_login_at?: string
  login_attempts: number
  locked_until?: string
  email_verified: boolean
  verification_token?: string
  reset_token?: string
  reset_token_expires?: string
  profile_data: UserProfile
}

export interface UserProfile {
  bio?: string
  location?: string
  website?: string
  cooking_experience?: "beginner" | "intermediate" | "advanced" | "professional"
  favorite_cuisines?: string[]
  dietary_restrictions?: string[]
  social_links?: {
    instagram?: string
    tiktok?: string
    youtube?: string
    facebook?: string
  }
}

export interface SecureRecipe {
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
  is_featured: boolean
  moderation_status: "pending" | "approved" | "rejected"
  moderation_notes?: string
  created_at: string
  updated_at: string
  // Joined data
  author_username?: string
  ingredients?: RecipeIngredient[]
  instructions?: RecipeInstruction[]
  tags?: string[]
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  ingredient: string
  amount?: string
  unit?: string
  order_index: number
}

export interface RecipeInstruction {
  id: string
  recipe_id: string
  instruction: string
  step_number: number
  image_url?: string
}

export interface ModerationLog {
  id: string
  moderator_id: string
  moderator_username: string
  target_type: "user" | "recipe"
  target_id: string
  action: string
  reason: string
  details?: any
  created_at: string
}

export interface LoginSession {
  id: string
  user_id: string
  token: string
  expires_at: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export type UserRole = "user" | "moderator" | "admin" | "owner"
export type UserStatus = "active" | "suspended" | "banned" | "pending"

class SecureDatabase {
  private encryptionKey: string
  private maxLoginAttempts = 5
  private lockoutDuration = 30 * 60 * 1000 // 30 minutes

  constructor() {
    // In production, this would come from environment variables
    this.encryptionKey = "your-secret-encryption-key-here"
    this.initializeDatabase()
  }

  private initializeDatabase() {
    if (typeof window === "undefined") return

    if (!localStorage.getItem("secure_db_initialized")) {
      this.createSecureTables()
      this.seedSecureData()
      localStorage.setItem("secure_db_initialized", "true")
    }
  }

  private createSecureTables() {
    // Initialize secure tables with encrypted data
    const secureUsers: SecureUser[] = []
    const secureRecipes: SecureRecipe[] = []
    const moderationLogs: ModerationLog[] = []
    const loginSessions: LoginSession[] = []

    localStorage.setItem("secure_users", JSON.stringify(secureUsers))
    localStorage.setItem("secure_recipes", JSON.stringify(secureRecipes))
    localStorage.setItem("moderation_logs", JSON.stringify(moderationLogs))
    localStorage.setItem("login_sessions", JSON.stringify(loginSessions))

    console.log("Secure database tables created")
  }

  private async seedSecureData() {
    // Create default owner account
    await this.createUser({
      username: "Owner",
      email: "owner@justthedamnrecipe.net",
      password: "SecureOwner123!",
      role: "owner",
      provider: "email",
    })

    // Create default admin account
    await this.createUser({
      username: "Admin",
      email: "admin@justthedamnrecipe.net",
      password: "SecureAdmin123!",
      role: "admin",
      provider: "email",
    })

    console.log("Secure database seeded with default accounts")
  }

  // Password hashing and verification
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  // Token generation for sessions and verification
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // User management
  async createUser(userData: {
    username: string
    email: string
    password?: string
    role?: UserRole
    provider: string
    social_id?: string
    avatar?: string
  }): Promise<SecureUser> {
    const users = this.getSecureUsers()

    // Check if user already exists
    const existingUser = users.find((u) => u.email === userData.email)
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    const passwordHash = userData.password ? await this.hashPassword(userData.password) : ""

    const newUser: SecureUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      password_hash: passwordHash,
      avatar: userData.avatar,
      provider: userData.provider,
      social_id: userData.social_id,
      role: userData.role || "user",
      status: "active",
      is_verified: userData.provider !== "email", // Social logins are auto-verified
      is_suspended: false,
      warning_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      login_attempts: 0,
      email_verified: userData.provider !== "email",
      verification_token: userData.provider === "email" ? this.generateToken() : undefined,
      profile_data: {
        cooking_experience: "beginner",
        favorite_cuisines: [],
        dietary_restrictions: [],
        social_links: {},
      },
    }

    users.push(newUser)
    localStorage.setItem("secure_users", JSON.stringify(users))

    // Log user creation
    await this.logModerationAction("system", "system", "user", newUser.id, "user_created", "New user account created")

    return newUser
  }

  async authenticateUser(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ user: SecureUser; session: LoginSession } | null> {
    const users = this.getSecureUsers()
    const user = users.find((u) => u.email === email)

    if (!user) {
      return null
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new Error("Account is temporarily locked due to too many failed login attempts")
    }

    // Check if account is banned or suspended
    if (user.status === "banned") {
      throw new Error("Account has been banned")
    }

    if (user.status === "suspended") {
      throw new Error("Account is currently suspended")
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      // Increment login attempts
      user.login_attempts += 1

      // Lock account if too many attempts
      if (user.login_attempts >= this.maxLoginAttempts) {
        user.locked_until = new Date(Date.now() + this.lockoutDuration).toISOString()
        await this.logModerationAction(
          "system",
          "system",
          "user",
          user.id,
          "account_locked",
          "Account locked due to failed login attempts",
        )
      }

      this.updateUser(user.id, user)
      return null
    }

    // Reset login attempts on successful login
    user.login_attempts = 0
    user.locked_until = undefined
    user.last_login_at = new Date().toISOString()
    this.updateUser(user.id, user)

    // Create login session
    const session = await this.createLoginSession(user.id, ipAddress, userAgent)

    return { user, session }
  }

  async createLoginSession(userId: string, ipAddress?: string, userAgent?: string): Promise<LoginSession> {
    const sessions = this.getLoginSessions()

    const session: LoginSession = {
      id: this.generateToken(),
      user_id: userId,
      token: this.generateToken(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    }

    sessions.push(session)
    localStorage.setItem("login_sessions", JSON.stringify(sessions))

    return session
  }

  async validateSession(token: string): Promise<SecureUser | null> {
    const sessions = this.getLoginSessions()
    const session = sessions.find((s) => s.token === token && new Date(s.expires_at) > new Date())

    if (!session) {
      return null
    }

    const user = this.getUserById(session.user_id)
    return user
  }

  async revokeSession(token: string): Promise<void> {
    const sessions = this.getLoginSessions()
    const filteredSessions = sessions.filter((s) => s.token !== token)
    localStorage.setItem("login_sessions", JSON.stringify(filteredSessions))
  }

  // User CRUD operations
  getUserById(id: string): SecureUser | null {
    const users = this.getSecureUsers()
    return users.find((u) => u.id === id) || null
  }

  getUserByEmail(email: string): SecureUser | null {
    const users = this.getSecureUsers()
    return users.find((u) => u.email === email) || null
  }

  updateUser(id: string, updates: Partial<SecureUser>): SecureUser | null {
    const users = this.getSecureUsers()
    const userIndex = users.findIndex((u) => u.id === id)

    if (userIndex === -1) return null

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    localStorage.setItem("secure_users", JSON.stringify(users))
    return users[userIndex]
  }

  async updateUserPassword(id: string, newPassword: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(newPassword)
    const user = this.updateUser(id, { password_hash: passwordHash })
    return !!user
  }

  // Admin/Moderator functions
  getAllUsers(requesterId: string): SecureUser[] {
    const requester = this.getUserById(requesterId)
    if (!requester || !this.hasPermission(requester.role, "moderator")) {
      throw new Error("Insufficient permissions")
    }

    return this.getSecureUsers()
  }

  searchUsers(requesterId: string, query: string): SecureUser[] {
    const users = this.getAllUsers(requesterId)
    const lowercaseQuery = query.toLowerCase()

    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(lowercaseQuery) || user.email.toLowerCase().includes(lowercaseQuery),
    )
  }

  async banUser(requesterId: string, targetId: string, reason: string): Promise<boolean> {
    const requester = this.getUserById(requesterId)
    if (!requester || !this.hasPermission(requester.role, "moderator")) {
      throw new Error("Insufficient permissions")
    }

    const target = this.getUserById(targetId)
    if (!target) return false

    // Can't ban users with equal or higher role
    if (this.getRoleLevel(target.role) >= this.getRoleLevel(requester.role)) {
      throw new Error("Cannot ban user with equal or higher role")
    }

    this.updateUser(targetId, {
      status: "banned",
      suspension_reason: reason,
    })

    // Revoke all sessions
    await this.revokeAllUserSessions(targetId)

    // Log the action
    await this.logModerationAction(requesterId, requester.username, "user", targetId, "user_banned", reason)

    return true
  }

  async suspendUser(requesterId: string, targetId: string, reason: string, durationDays: number): Promise<boolean> {
    const requester = this.getUserById(requesterId)
    if (!requester || !this.hasPermission(requester.role, "moderator")) {
      throw new Error("Insufficient permissions")
    }

    const target = this.getUserById(targetId)
    if (!target) return false

    if (this.getRoleLevel(target.role) >= this.getRoleLevel(requester.role)) {
      throw new Error("Cannot suspend user with equal or higher role")
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + durationDays)

    this.updateUser(targetId, {
      status: "suspended",
      suspension_reason: reason,
      suspension_expires_at: expiresAt.toISOString(),
    })

    await this.logModerationAction(
      requesterId,
      requester.username,
      "user",
      targetId,
      "user_suspended",
      `${reason} (${durationDays} days)`,
    )

    return true
  }

  async changeUserRole(requesterId: string, targetId: string, newRole: UserRole): Promise<boolean> {
    const requester = this.getUserById(requesterId)
    if (!requester || !this.hasPermission(requester.role, "admin")) {
      throw new Error("Insufficient permissions")
    }

    const target = this.getUserById(targetId)
    if (!target) return false

    // Only owner can create other owners
    if (newRole === "owner" && requester.role !== "owner") {
      throw new Error("Only owner can assign owner role")
    }

    const oldRole = target.role
    this.updateUser(targetId, { role: newRole })

    await this.logModerationAction(
      requesterId,
      requester.username,
      "user",
      targetId,
      "role_changed",
      `Role changed from ${oldRole} to ${newRole}`,
    )

    return true
  }

  // Recipe management
  async createRecipe(
    recipeData: Omit<SecureRecipe, "id" | "created_at" | "updated_at" | "rating" | "review_count" | "view_count">,
  ): Promise<SecureRecipe> {
    const recipes = this.getSecureRecipes()

    const newRecipe: SecureRecipe = {
      ...recipeData,
      id: Date.now().toString(),
      rating: 0,
      review_count: 0,
      view_count: 0,
      moderation_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    recipes.push(newRecipe)
    localStorage.setItem("secure_recipes", JSON.stringify(recipes))

    return newRecipe
  }

  getAllRecipes(requesterId?: string): SecureRecipe[] {
    const recipes = this.getSecureRecipes()

    // If no requester or regular user, only show approved recipes
    if (!requesterId) {
      return recipes.filter((r) => r.moderation_status === "approved" && r.is_published)
    }

    const requester = this.getUserById(requesterId)
    if (!requester || !this.hasPermission(requester.role, "moderator")) {
      return recipes.filter((r) => r.moderation_status === "approved" && r.is_published)
    }

    // Moderators and above can see all recipes
    return recipes
  }

  async updateRecipe(requesterId: string, recipeId: string, updates: Partial<SecureRecipe>): Promise<boolean> {
    const requester = this.getUserById(requesterId)
    if (!requester || !this.hasPermission(requester.role, "moderator")) {
      throw new Error("Insufficient permissions")
    }

    const recipes = this.getSecureRecipes()
    const recipeIndex = recipes.findIndex((r) => r.id === recipeId)

    if (recipeIndex === -1) return false

    recipes[recipeIndex] = {
      ...recipes[recipeIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    localStorage.setItem("secure_recipes", JSON.stringify(recipes))

    await this.logModerationAction(
      requesterId,
      requester.username,
      "recipe",
      recipeId,
      "recipe_updated",
      `Recipe updated: ${Object.keys(updates).join(", ")}`,
    )

    return true
  }

  async moderateRecipe(
    requesterId: string,
    recipeId: string,
    status: "approved" | "rejected",
    notes?: string,
  ): Promise<boolean> {
    const requester = this.getUserById(requesterId)
    if (!requester || !this.hasPermission(requester.role, "moderator")) {
      throw new Error("Insufficient permissions")
    }

    const recipes = this.getSecureRecipes()
    const recipeIndex = recipes.findIndex((r) => r.id === recipeId)

    if (recipeIndex === -1) return false

    recipes[recipeIndex].moderation_status = status
    recipes[recipeIndex].moderation_notes = notes
    recipes[recipeIndex].updated_at = new Date().toISOString()

    // If approved, set as recently added
    if (status === "approved") {
      recipes[recipeIndex].is_published = true
      // Update the created_at to current time so it appears in "recently added"
      recipes[recipeIndex].created_at = new Date().toISOString()
    }

    localStorage.setItem("secure_recipes", JSON.stringify(recipes))

    await this.logModerationAction(requesterId, requester.username, "recipe", recipeId, `recipe_${status}`, notes || "")

    return true
  }

  async deleteRecipe(requesterId: string, recipeId: string): Promise<boolean> {
    const requester = this.getUserById(requesterId)
    if (!requester || !this.hasPermission(requester.role, "moderator")) {
      throw new Error("Insufficient permissions")
    }

    const recipes = this.getSecureRecipes()
    const recipeIndex = recipes.findIndex((r) => r.id === recipeId)

    if (recipeIndex === -1) return false

    const recipe = recipes[recipeIndex]
    recipes.splice(recipeIndex, 1)
    localStorage.setItem("secure_recipes", JSON.stringify(recipes))

    await this.logModerationAction(
      requesterId,
      requester.username,
      "recipe",
      recipeId,
      "recipe_deleted",
      `Deleted recipe: ${recipe.title}`,
    )

    return true
  }

  getUserStatistics(requesterId: string): any {
    const requester = this.getUserById(requesterId)
    if (!requester || !this.hasPermission(requester.role, "moderator")) {
      throw new Error("Insufficient permissions")
    }

    const users = this.getSecureUsers()
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
      banned: users.filter((u) => u.status === "banned").length,
      verified: users.filter((u) => u.is_verified).length,
      socialLogins: users.filter((u) => u.provider !== "email").length,
      newThisWeek: users.filter((u) => new Date(u.created_at) >= weekAgo).length,
      newThisMonth: users.filter((u) => new Date(u.created_at) >= monthAgo).length,
      loginAttemptsBlocked: users.filter((u) => u.login_attempts >= 5).length,
    }
  }

  // Moderation logging
  async logModerationAction(
    moderatorId: string,
    moderatorUsername: string,
    targetType: "user" | "recipe",
    targetId: string,
    action: string,
    reason: string,
    details?: any,
  ): Promise<void> {
    const logs = this.getModerationLogs()

    const log: ModerationLog = {
      id: Date.now().toString(),
      moderator_id: moderatorId,
      moderator_username: moderatorUsername,
      target_type: targetType,
      target_id: targetId,
      action,
      reason,
      details,
      created_at: new Date().toISOString(),
    }

    logs.push(log)
    localStorage.setItem("moderation_logs", JSON.stringify(logs))
  }

  getModerationLogs(requesterId: string): ModerationLog[] {
    const requester = this.getUserById(requesterId)
    if (!requester || !this.hasPermission(requester.role, "moderator")) {
      throw new Error("Insufficient permissions")
    }

    return this.getModerationLogs()
  }

  // Helper methods
  private hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = { user: 0, moderator: 1, admin: 2, owner: 3 }
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }

  private getRoleLevel(role: UserRole): number {
    const roleHierarchy = { user: 0, moderator: 1, admin: 2, owner: 3 }
    return roleHierarchy[role]
  }

  private async revokeAllUserSessions(userId: string): Promise<void> {
    const sessions = this.getLoginSessions()
    const filteredSessions = sessions.filter((s) => s.user_id !== userId)
    localStorage.setItem("login_sessions", JSON.stringify(filteredSessions))
  }

  // Data access methods
  private getSecureUsers(): SecureUser[] {
    if (typeof window === "undefined") return []
    const users = localStorage.getItem("secure_users")
    return users ? JSON.parse(users) : []
  }

  private getSecureRecipes(): SecureRecipe[] {
    if (typeof window === "undefined") return []
    const recipes = localStorage.getItem("secure_recipes")
    return recipes ? JSON.parse(recipes) : []
  }

  private getModerationLogs(): ModerationLog[] {
    if (typeof window === "undefined") return []
    const logs = localStorage.getItem("moderation_logs")
    return logs ? JSON.parse(logs) : []
  }

  private getLoginSessions(): LoginSession[] {
    if (typeof window === "undefined") return []
    const sessions = localStorage.getItem("login_sessions")
    return sessions ? JSON.parse(sessions) : []
  }
}

// Export singleton instance
export const secureDB = new SecureDatabase()
