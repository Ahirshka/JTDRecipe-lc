"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  username: string
  email: string
  role: string
  avatar?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Failed to refresh user:", error)
      setUser(null)
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      await refreshUser()
      setLoading(false)
    }
    loadUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
