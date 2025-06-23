"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  getCurrentUser,
  setCurrentUser,
  logout as logoutUser,
  toggleFavorite as toggleFavoriteRecipe,
  rateRecipe as rateUserRecipe,
  getUserRating as getUserRecipeRating,
  isFavorited as isRecipeFavorited,
  findUserById,
  saveSocialUser,
  initializeOwnerAccount,
} from "@/lib/auth"
import { getSocialLoginFunction, type SocialUser } from "@/lib/social-auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  loginWithSocial: (provider: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  toggleFavorite: (recipeId: string) => boolean
  rateRecipe: (recipeId: string, rating: number) => boolean
  getUserRating: (recipeId: string) => number | null
  isFavorited: (recipeId: string) => boolean
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize owner account on first load
    initializeOwnerAccount()

    // Check for existing user session on mount
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    setCurrentUser(userData)
  }

  const loginWithSocial = async (provider: string): Promise<boolean> => {
    try {
      const socialLoginFn = getSocialLoginFunction(provider)
      const socialUser: SocialUser | null = await socialLoginFn()

      if (!socialUser) {
        throw new Error("Social login failed")
      }

      // Save or update user with social data
      const user = saveSocialUser({
        email: socialUser.email,
        username: socialUser.name,
        avatar: socialUser.avatar,
        provider: socialUser.provider,
        socialId: socialUser.id,
      })

      login(user)
      return true
    } catch (error) {
      console.error(`${provider} login failed:`, error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    logoutUser()
  }

  const refreshUser = () => {
    if (user) {
      const updatedUser = findUserById(user.id)
      if (updatedUser) {
        setUser(updatedUser)
        setCurrentUser(updatedUser)
      }
    }
  }

  const toggleFavorite = (recipeId: string): boolean => {
    if (!user) return false
    const result = toggleFavoriteRecipe(user.id, recipeId)
    refreshUser()
    return result
  }

  const rateRecipe = (recipeId: string, rating: number): boolean => {
    if (!user) return false
    const result = rateUserRecipe(user.id, recipeId, rating)
    refreshUser()
    return result
  }

  const getUserRating = (recipeId: string): number | null => {
    if (!user) return null
    return getUserRecipeRating(user.id, recipeId)
  }

  const isFavorited = (recipeId: string): boolean => {
    if (!user) return false
    return isRecipeFavorited(user.id, recipeId)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    loginWithSocial,
    logout,
    loading,
    toggleFavorite,
    rateRecipe,
    getUserRating,
    isFavorited,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
