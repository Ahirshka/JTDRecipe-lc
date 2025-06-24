"use server"

import { sql } from "./neon"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface User {
  id: string
  username: string
  email: string
  role: string
  avatar?: string
  created_at: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

// Create a new user
export async function createUser(userData: {
  username: string
  email: string
  password: string
  provider?: string
}): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${userData.email} OR username = ${userData.username}
    `

    if (existingUser.length > 0) {
      return { success: false, error: "User already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Create user
    const newUser = await sql`
      INSERT INTO users (username, email, password_hash, provider, role, status)
      VALUES (${userData.username}, ${userData.email}, ${hashedPassword}, ${userData.provider || "email"}, 'user', 'active')
      RETURNING id, username, email, role, avatar, created_at
    `

    if (newUser.length === 0) {
      return { success: false, error: "Failed to create user" }
    }

    // Create user profile
    await sql`
      INSERT INTO user_profiles (user_id, cooking_experience, favorite_cuisines, dietary_restrictions, social_links)
      VALUES (${newUser[0].id}, 'beginner', '[]', '[]', '{}')
    `

    return {
      success: true,
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        role: newUser[0].role,
        avatar: newUser[0].avatar,
        created_at: newUser[0].created_at,
      },
    }
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, error: "Failed to create user" }
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Get user by email
    const users = await sql`
      SELECT id, username, email, password_hash, role, avatar, status, created_at 
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const user = users[0]

    if (user.status !== "active") {
      return { success: false, error: "Account is not active" }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    // Create session
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    await sql`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt.toISOString()})
    `

    // Set session cookie
    cookies().set("session_token", sessionToken, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        created_at: user.created_at,
      },
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  try {
    const sessionToken = cookies().get("session_token")?.value
    if (!sessionToken) {
      return null
    }

    // Get user from session
    const sessionResult = await sql`
      SELECT u.id, u.username, u.email, u.role, u.avatar, u.created_at
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken} AND s.expires_at > NOW() AND u.status = 'active'
    `

    if (sessionResult.length === 0) {
      return null
    }

    const user = sessionResult[0]
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      created_at: user.created_at,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    const sessionToken = cookies().get("session_token")?.value
    if (sessionToken) {
      await sql`DELETE FROM user_sessions WHERE token = ${sessionToken}`
    }
    cookies().delete("session_token")
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// Login action for form submission
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const result = await authenticateUser(email, password)

  if (result.success) {
    redirect("/")
  } else {
    throw new Error(result.error || "Login failed")
  }
}

// Signup action for form submission
export async function signupAction(formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm-password") as string

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match")
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long")
  }

  const result = await createUser({ username, email, password })

  if (result.success) {
    // Auto-login after signup
    await authenticateUser(email, password)
    redirect("/")
  } else {
    throw new Error(result.error || "Signup failed")
  }
}

// Client-callable wrapper functions
export async function loginUser(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  return await authenticateUser(email, password)
}

export async function registerUser(formData: FormData): Promise<AuthResult> {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validation
  if (!username || !email || !password || !confirmPassword) {
    return { success: false, error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" }
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long" }
  }

  const result = await createUser({ username, email, password })

  if (result.success) {
    // Auto-login after successful registration
    return await authenticateUser(email, password)
  }

  return result
}
