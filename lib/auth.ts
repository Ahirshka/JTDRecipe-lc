export interface User {
  id: string
  username: string
  email: string
  password?: string // Optional for social logins
  avatar?: string
  provider?: string // 'email', 'google', 'facebook', 'instagram', 'tiktok'
  socialId?: string // ID from social provider
  role: UserRole // New role field
  status: UserStatus // New status field
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  moderationNotes?: ModerationNote[]
  favorites: string[]
  ratings: UserRating[]
  // Moderation fields
  isVerified: boolean
  isSuspended: boolean
  suspensionReason?: string
  suspensionExpiresAt?: string
  warningCount: number
}

export type UserRole = "user" | "moderator" | "admin" | "owner"
export type UserStatus = "active" | "suspended" | "banned" | "pending"

export interface ModerationNote {
  id: string
  moderatorId: string
  moderatorName: string
  note: string
  action: ModerationAction
  createdAt: string
}

export type ModerationAction = "warning" | "suspension" | "ban" | "note" | "verification" | "role_change"

export interface UserRating {
  recipeId: string
  rating: number
  createdAt: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  owner: 3,
}

// Permission checking functions
export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export const canModerateUser = (moderatorRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_HIERARCHY[moderatorRole] > ROLE_HIERARCHY[targetRole]
}

// Simple storage functions (in production, use a proper database)
export const saveUser = (
  userData: Omit<
    User,
    "id" | "createdAt" | "updatedAt" | "favorites" | "ratings" | "isVerified" | "isSuspended" | "warningCount"
  >,
): User => {
  const users = getUsers()
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorites: [],
    ratings: [],
    isVerified: false,
    isSuspended: false,
    warningCount: 0,
    role: userData.role || "user",
    status: userData.status || "active",
  }

  users.push(newUser)
  localStorage.setItem("recipe_users", JSON.stringify(users))
  return newUser
}

export const saveSocialUser = (socialData: {
  email: string
  username: string
  avatar?: string
  provider: string
  socialId: string
}): User => {
  const users = getUsers()

  // Check if user already exists with this social account
  const existingUser = users.find(
    (user) => user.socialId === socialData.socialId && user.provider === socialData.provider,
  )

  if (existingUser) {
    // Update last login
    existingUser.lastLoginAt = new Date().toISOString()
    existingUser.updatedAt = new Date().toISOString()
    updateUser(existingUser.id, existingUser)
    return existingUser
  }

  // Check if user exists with same email but different provider
  const emailUser = users.find((user) => user.email === socialData.email)
  if (emailUser) {
    // Link social account to existing email account
    const updatedUser = {
      ...emailUser,
      provider: socialData.provider,
      socialId: socialData.socialId,
      avatar: socialData.avatar || emailUser.avatar,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const userIndex = users.findIndex((user) => user.id === emailUser.id)
    users[userIndex] = updatedUser
    localStorage.setItem("recipe_users", JSON.stringify(users))
    return updatedUser
  }

  // Create new social user
  const newUser: User = {
    id: Date.now().toString(),
    username: socialData.username,
    email: socialData.email,
    avatar: socialData.avatar,
    provider: socialData.provider,
    socialId: socialData.socialId,
    role: "user",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    favorites: [],
    ratings: [],
    isVerified: false,
    isSuspended: false,
    warningCount: 0,
  }

  users.push(newUser)
  localStorage.setItem("recipe_users", JSON.stringify(users))
  return newUser
}

export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const users = getUsers()
  const userIndex = users.findIndex((user) => user.id === userId)

  if (userIndex === -1) return null

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem("recipe_users", JSON.stringify(users))

  // Update current user if it's the same user
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.id === userId) {
    setCurrentUser(users[userIndex])
  }

  return users[userIndex]
}

export const getUsers = (): User[] => {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem("recipe_users")
  return users ? JSON.parse(users) : []
}

export const getAllUsersForModeration = (): User[] => {
  return getUsers().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const findUser = (email: string, password: string): User | null => {
  const users = getUsers()
  const user = users.find((user) => user.email === email && user.password === password) || null

  if (user) {
    // Update last login
    updateUser(user.id, { lastLoginAt: new Date().toISOString() })
    return { ...user, lastLoginAt: new Date().toISOString() }
  }

  return null
}

export const findUserByEmail = (email: string): User | null => {
  const users = getUsers()
  return users.find((user) => user.email === email) || null
}

export const findUserById = (id: string): User | null => {
  const users = getUsers()
  return users.find((user) => user.id === id) || null
}

export const findUserBySocialId = (socialId: string, provider: string): User | null => {
  const users = getUsers()
  return users.find((user) => user.socialId === socialId && user.provider === provider) || null
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const currentUser = localStorage.getItem("current_user")
  return currentUser ? JSON.parse(currentUser) : null
}

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem("current_user", JSON.stringify(user))
  } else {
    localStorage.removeItem("current_user")
  }
}

export const logout = (): void => {
  localStorage.removeItem("current_user")
}

// Moderation functions
export const addModerationNote = (
  userId: string,
  moderatorId: string,
  moderatorName: string,
  note: string,
  action: ModerationAction,
): boolean => {
  const user = findUserById(userId)
  if (!user) return false

  const moderationNote: ModerationNote = {
    id: Date.now().toString(),
    moderatorId,
    moderatorName,
    note,
    action,
    createdAt: new Date().toISOString(),
  }

  const updatedNotes = [...(user.moderationNotes || []), moderationNote]
  updateUser(userId, { moderationNotes: updatedNotes })
  return true
}

export const suspendUser = (
  userId: string,
  moderatorId: string,
  moderatorName: string,
  reason: string,
  durationDays: number,
): boolean => {
  const user = findUserById(userId)
  if (!user) return false

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + durationDays)

  updateUser(userId, {
    isSuspended: true,
    status: "suspended",
    suspensionReason: reason,
    suspensionExpiresAt: expiresAt.toISOString(),
  })

  addModerationNote(userId, moderatorId, moderatorName, `Suspended for ${durationDays} days: ${reason}`, "suspension")
  return true
}

export const unsuspendUser = (userId: string, moderatorId: string, moderatorName: string): boolean => {
  const user = findUserById(userId)
  if (!user) return false

  updateUser(userId, {
    isSuspended: false,
    status: "active",
    suspensionReason: undefined,
    suspensionExpiresAt: undefined,
  })

  addModerationNote(userId, moderatorId, moderatorName, "Suspension lifted", "note")
  return true
}

export const banUser = (userId: string, moderatorId: string, moderatorName: string, reason: string): boolean => {
  const user = findUserById(userId)
  if (!user) return false

  updateUser(userId, {
    status: "banned",
    suspensionReason: reason,
  })

  addModerationNote(userId, moderatorId, moderatorName, `Permanently banned: ${reason}`, "ban")
  return true
}

export const changeUserRole = (
  userId: string,
  newRole: UserRole,
  moderatorId: string,
  moderatorName: string,
): boolean => {
  const user = findUserById(userId)
  if (!user) return false

  const oldRole = user.role
  updateUser(userId, { role: newRole })

  addModerationNote(userId, moderatorId, moderatorName, `Role changed from ${oldRole} to ${newRole}`, "role_change")
  return true
}

export const verifyUser = (userId: string, moderatorId: string, moderatorName: string): boolean => {
  const user = findUserById(userId)
  if (!user) return false

  updateUser(userId, { isVerified: true })
  addModerationNote(userId, moderatorId, moderatorName, "User verified", "verification")
  return true
}

export const warnUser = (userId: string, moderatorId: string, moderatorName: string, reason: string): boolean => {
  const user = findUserById(userId)
  if (!user) return false

  updateUser(userId, { warningCount: (user.warningCount || 0) + 1 })
  addModerationNote(userId, moderatorId, moderatorName, `Warning issued: ${reason}`, "warning")
  return true
}

// Initialize owner account if it doesn't exist
export const initializeOwnerAccount = (): void => {
  const users = getUsers()
  const ownerExists = users.some((user) => user.role === "owner")

  if (!ownerExists) {
    const ownerUser: User = {
      id: "owner-" + Date.now(),
      username: "Owner",
      email: "owner@justthedamnrecipe.net",
      password: "owner123", // In production, this should be properly hashed
      role: "owner",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorites: [],
      ratings: [],
      isVerified: true,
      isSuspended: false,
      warningCount: 0,
    }

    users.push(ownerUser)
    localStorage.setItem("recipe_users", JSON.stringify(users))
  }
}

// Recipe interaction functions (unchanged)
export const toggleFavorite = (userId: string, recipeId: string): boolean => {
  const user = findUserById(userId)
  if (!user) return false

  const favorites = user.favorites || []
  const isFavorited = favorites.includes(recipeId)

  const updatedFavorites = isFavorited ? favorites.filter((id) => id !== recipeId) : [...favorites, recipeId]

  updateUser(userId, { favorites: updatedFavorites })
  return !isFavorited
}

export const rateRecipe = (userId: string, recipeId: string, rating: number): boolean => {
  const user = findUserById(userId)
  if (!user) return false

  const ratings = user.ratings || []
  const existingRatingIndex = ratings.findIndex((r) => r.recipeId === recipeId)

  const newRating: UserRating = {
    recipeId,
    rating,
    createdAt: new Date().toISOString(),
  }

  let updatedRatings: UserRating[]
  if (existingRatingIndex >= 0) {
    // Update existing rating
    updatedRatings = [...ratings]
    updatedRatings[existingRatingIndex] = newRating
  } else {
    // Add new rating
    updatedRatings = [...ratings, newRating]
  }

  updateUser(userId, { ratings: updatedRatings })
  return true
}

export const getUserRating = (userId: string, recipeId: string): number | null => {
  const user = findUserById(userId)
  if (!user) return null

  const rating = user.ratings?.find((r) => r.recipeId === recipeId)
  return rating ? rating.rating : null
}

export const isFavorited = (userId: string, recipeId: string): boolean => {
  const user = findUserById(userId)
  if (!user) return false

  return user.favorites?.includes(recipeId) || false
}
