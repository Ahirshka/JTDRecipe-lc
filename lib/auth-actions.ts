import { cookies } from "next/headers"
import type { User } from "@/types"
import { sql, initializeDatabase } from "./neon"

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Initialize database if needed
    await initializeDatabase()

    const cookieStore = cookies()
    const token = cookieStore.get("session")?.value

    if (!token) {
      return null
    }

    const sessions = await sql`
      SELECT u.*, s.expires_at
      FROM users u
      JOIN user_sessions s ON u.id = s.user_id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      return null
    }

    const user = sessions[0]
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
      created_at: user.created_at,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Client-callable wrapper functions for form submissions
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    await initializeDatabase()

    const users = await sql`
      SELECT id, username, email, password_hash, role, avatar, status, created_at 
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = users[0]

    if (user.status !== "active") {
      return { success: false, error: "Account is not active" }
    }

    // For demo purposes, we'll skip password verification
    // In production, you'd use bcrypt.compare(password, user.password_hash)

    // Create session
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    await sql`
      INSERT INTO user_sessions (id, user_id, token, expires_at, created_at)
      VALUES (${crypto.randomUUID()}, ${user.id}, ${sessionToken}, ${expiresAt.toISOString()}, NOW())
    `

    // Set session cookie
    cookies().set("session", sessionToken, {
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
        status: user.status,
        is_verified: user.is_verified || false,
        created_at: user.created_at,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Login failed" }
  }
}

export async function registerUser(userData: {
  username: string
  email: string
  password: string
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    await initializeDatabase()

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE email = ${userData.email} OR username = ${userData.username}
    `

    if (existingUsers.length > 0) {
      return { success: false, error: "User already exists with this email or username" }
    }

    // Create user (password hashing skipped for demo)
    const userId = crypto.randomUUID()

    await sql`
      INSERT INTO users (id, username, email, password_hash, provider, role, status, is_verified, created_at, updated_at)
      VALUES (
        ${userId}, 
        ${userData.username}, 
        ${userData.email}, 
        ${userData.password}, 
        'email', 
        'user', 
        'active', 
        false, 
        NOW(), 
        NOW()
      )
    `

    // Get the created user
    const users = await sql`
      SELECT id, username, email, role, avatar, status, is_verified, created_at
      FROM users 
      WHERE id = ${userId}
    `

    if (users.length === 0) {
      return { success: false, error: "Failed to create user" }
    }

    const user = users[0]

    // Auto-login after registration
    const loginResult = await loginUser(userData.email, userData.password)

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Registration failed" }
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (sessionToken) {
      await sql`DELETE FROM user_sessions WHERE token = ${sessionToken}`
    }

    cookies().delete("session")
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false }
  }
}
