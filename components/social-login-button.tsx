"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface SocialLoginButtonProps {
  provider: {
    id: string
    name: string
    icon: string
    color: string
    textColor?: string
    hoverColor?: string
    logo?: string
    gradient?: string
  }
  onLogin: (provider: string) => Promise<void>
  disabled?: boolean
}

export function SocialLoginButton({ provider, onLogin, disabled }: SocialLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleClick = async () => {
    setIsLoading(true)

    try {
      // Simulate real OAuth flow
      await handleRealSocialLogin(provider.id)
    } catch (error) {
      console.error(`${provider.name} login failed:`, error)
      toast({
        title: "Login Failed",
        description: `Unable to login with ${provider.name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRealSocialLogin = async (providerId: string) => {
    // In production, these would be real OAuth implementations
    switch (providerId) {
      case "google":
        await handleGoogleLogin()
        break
      case "facebook":
        await handleFacebookLogin()
        break
      case "instagram":
        await handleInstagramLogin()
        break
      case "tiktok":
        await handleTikTokLogin()
        break
      default:
        throw new Error(`Unsupported provider: ${providerId}`)
    }
  }

  const handleGoogleLogin = async () => {
    // Real Google OAuth implementation would use Google Identity Services
    // For demo: simulate the OAuth flow
    const mockGoogleUser = {
      id: `google_${Date.now()}`,
      email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
      name: `Google User ${Math.floor(Math.random() * 100)}`,
      picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      verified_email: true,
    }

    // Simulate OAuth popup and callback
    await simulateOAuthFlow("Google", mockGoogleUser, "google")
  }

  const handleFacebookLogin = async () => {
    // Real Facebook implementation would use Facebook SDK
    const mockFacebookUser = {
      id: `facebook_${Date.now()}`,
      email: `user${Math.floor(Math.random() * 1000)}@facebook.com`,
      name: `Facebook User ${Math.floor(Math.random() * 100)}`,
      picture: {
        data: {
          url: "https://graph.facebook.com/me/picture?type=large",
        },
      },
    }

    await simulateOAuthFlow("Facebook", mockFacebookUser, "facebook")
  }

  const handleInstagramLogin = async () => {
    // Real Instagram implementation would use Instagram Basic Display API
    const mockInstagramUser = {
      id: `instagram_${Date.now()}`,
      username: `insta_user_${Math.floor(Math.random() * 1000)}`,
      account_type: "PERSONAL",
      media_count: Math.floor(Math.random() * 100),
    }

    // Instagram doesn't provide email directly, so we'll simulate asking for it
    const email = `${mockInstagramUser.username}@instagram-connected.com`

    await simulateOAuthFlow(
      "Instagram",
      {
        ...mockInstagramUser,
        email,
        name: mockInstagramUser.username,
      },
      "instagram",
    )
  }

  const handleTikTokLogin = async () => {
    // Real TikTok implementation would use TikTok Login Kit
    const mockTikTokUser = {
      open_id: `tiktok_${Date.now()}`,
      union_id: `union_${Date.now()}`,
      avatar_url:
        "https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png",
      display_name: `TikTok User ${Math.floor(Math.random() * 100)}`,
    }

    // TikTok requires separate email permission
    const email = `tiktok_user_${Math.floor(Math.random() * 1000)}@tiktok-connected.com`

    await simulateOAuthFlow(
      "TikTok",
      {
        id: mockTikTokUser.open_id,
        email,
        name: mockTikTokUser.display_name,
        avatar: mockTikTokUser.avatar_url,
      },
      "tiktok",
    )
  }

  const simulateOAuthFlow = async (platformName: string, userData: any, providerId: string) => {
    // Simulate OAuth popup window
    toast({
      title: `Connecting to ${platformName}`,
      description: "Opening authentication window...",
    })

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create user account or login existing user
    const user = {
      id: Date.now().toString(),
      username: userData.name || userData.display_name || userData.username,
      email: userData.email,
      avatar: userData.picture?.data?.url || userData.picture || userData.avatar,
      provider: providerId,
      socialId: userData.id || userData.open_id,
      role: "user" as const,
      status: "active" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorites: [],
      ratings: [],
      myRecipes: [],
      isVerified: true, // Social logins are auto-verified
      isSuspended: false,
      warningCount: 0,
    }

    // Save to localStorage (in production, this would be saved to database)
    const users = JSON.parse(localStorage.getItem("recipe_users") || "[]")

    // Check if user already exists
    const existingUser = users.find(
      (u: any) => u.email === user.email || (u.socialId === user.socialId && u.provider === user.provider),
    )

    if (existingUser) {
      // Update existing user
      existingUser.lastLoginAt = new Date().toISOString()
      existingUser.avatar = user.avatar || existingUser.avatar
      localStorage.setItem("recipe_users", JSON.stringify(users))
      login(existingUser)
    } else {
      // Create new user
      users.push(user)
      localStorage.setItem("recipe_users", JSON.stringify(users))
      login(user)
    }

    toast({
      title: "Login Successful!",
      description: `Welcome to JTDRecipe, ${user.username}!`,
    })

    router.push("/")
  }

  const buttonStyle = provider.gradient ? { background: provider.gradient } : { backgroundColor: provider.color }

  return (
    <Button
      variant="outline"
      className={`w-full relative overflow-hidden border-0 transition-all duration-200 ${
        provider.textColor || "text-white"
      } ${provider.hoverColor || ""} hover:scale-[1.02] active:scale-[0.98]`}
      style={buttonStyle}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      <div className="flex items-center justify-center w-full">
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : provider.id === "google" ? (
          <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
        ) : provider.id === "facebook" ? (
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ) : provider.id === "instagram" ? (
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        ) : provider.id === "tiktok" ? (
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </svg>
        ) : (
          <span className="text-lg mr-2">{provider.icon}</span>
        )}
        <span className="font-medium">{isLoading ? "Connecting..." : `Continue with ${provider.name}`}</span>
      </div>

      {/* Platform-specific styling overlays */}
      {provider.id === "google" && (
        <div className="absolute inset-0 border border-gray-300 rounded-md pointer-events-none" />
      )}
    </Button>
  )
}
