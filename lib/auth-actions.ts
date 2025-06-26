"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface User {
  id: string
  username: string
  email: string
  role: string
  avatar?: string
  status: string
  is_verified: boolean
  created_at: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

// Mock user for demonstration
const mockUser: User = {
  id: "1",
  username: "testuser",
  email: "test@example.com",
  role: "user",
  status: "active",
  is_verified: true,
  created_at: new Date().toISOString(),
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // In a real app, this would check the session/cookie
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return null
    }

    // Return mock user for now
    return mockUser
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function registerUser(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email"))
  const password = String(formData.get("password"))
  const username = String(formData.get("username"))

  try {
    // Mock registration - in real app, this would create user in database
    console.log("Registering user:", { email, username })

    // Set mock session cookie
    cookies().set("session_token", "mock-session-token", {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return {
      success: true,
      user: {
        ...mockUser,
        email,
        username,
      },
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: "Registration failed",
    }
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Mock login - in real app, this would verify credentials
    console.log("Logging in user:", email)

    // Set mock session cookie
    cookies().set("session_token", "mock-session-token", {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return {
      success: true,
      user: {
        ...mockUser,
        email,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "Login failed",
    }
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    // Clear session cookie
    cookies().delete("session_token")
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false }
  }
}

export async function signOut() {
  await logoutUser()
  redirect("/")
}

// Helper functions
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    // Mock user lookup
    if (email === mockUser.email) {
      return mockUser
    }
    return null
  } catch (error) {
    console.error("Find user by email error:", error)
    return null
  }
}

export async function createSession(userId: string): Promise<{ success: boolean; token?: string }> {
  try {
    const sessionToken = "mock-session-token"

    cookies().set("session_token", sessionToken, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return { success: true, token: sessionToken }
  } catch (error) {
    console.error("Create session error:", error)
    return { success: false }
  }
}
