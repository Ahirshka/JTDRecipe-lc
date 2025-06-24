"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { secureDB } from "@/lib/secure-database"

interface SocialLoginButtonProps {
  provider: "google" | "facebook" | "instagram" | "tiktok"
  children: React.ReactNode
}

export function SocialLoginButton({ provider, children }: SocialLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setIsAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSocialLogin = async () => {
    setIsLoading(true)

    try {
      // In a real implementation, this would use actual OAuth
      // For demo purposes, we'll simulate the OAuth flow
      const authUrl = getSocialAuthUrl(provider)

      // Open OAuth popup
      const popup = window.open(authUrl, `${provider}_oauth`, "width=500,height=600,scrollbars=yes,resizable=yes")

      // Listen for OAuth callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          // In real implementation, this would get the auth code from the callback
          handleOAuthCallback(provider)
        }
      }, 1000)
    } catch (error) {
      console.error(`${provider} login error:`, error)
      toast({
        title: "Login failed",
        description: `Failed to login with ${provider}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSocialAuthUrl = (provider: string): string => {
    // In production, these would be real OAuth URLs
    const authUrls = {
      google: `https://accounts.google.com/oauth/authorize?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback/google&response_type=code&scope=email profile`,
      facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_FB_APP_ID&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback/facebook&response_type=code&scope=email`,
      instagram: `https://api.instagram.com/oauth/authorize?client_id=YOUR_IG_CLIENT_ID&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback/instagram&response_type=code&scope=user_profile,user_media`,
      tiktok: `https://www.tiktok.com/auth/authorize/?client_key=YOUR_TIKTOK_CLIENT_KEY&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback/tiktok&response_type=code&scope=user.info.basic`,
    }

    return authUrls[provider as keyof typeof authUrls] || "#"
  }

  const handleOAuthCallback = async (provider: string) => {
    try {
      // In production, this would exchange the auth code for user data
      // For demo, we'll simulate getting user data
      const mockUserData = await getMockSocialUserData(provider)

      // Try to find existing user or create new one
      let user = secureDB.getUserByEmail(mockUserData.email)

      if (!user) {
        // Create new user account
        user = await secureDB.createUser({
          username: mockUserData.username,
          email: mockUserData.email,
          avatar: mockUserData.avatar,
          provider: provider,
          social_id: mockUserData.id,
          role: "user",
        })
      } else {
        // Update existing user with social login info
        secureDB.updateUser(user.id, {
          provider: provider,
          social_id: mockUserData.id,
          avatar: mockUserData.avatar || user.avatar,
          last_login_at: new Date().toISOString(),
        })
      }

      // Create login session
      const session = await secureDB.createLoginSession(user.id)

      // Set authentication state
      setUser(user)
      setIsAuthenticated(true)

      // Store session token
      localStorage.setItem("auth_token", session.token)

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      })

      router.push("/")
    } catch (error) {
      console.error("OAuth callback error:", error)
      toast({
        title: "Login failed",
        description: "Failed to complete social login. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getMockSocialUserData = async (provider: string) => {
    // In production, this would make actual API calls to get user data
    // For demo purposes, we'll return mock data
    const mockData = {
      google: {
        id: `google_${Date.now()}`,
        username: `GoogleUser${Math.floor(Math.random() * 1000)}`,
        email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
        avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      },
      facebook: {
        id: `facebook_${Date.now()}`,
        username: `FacebookUser${Math.floor(Math.random() * 1000)}`,
        email: `user${Math.floor(Math.random() * 1000)}@facebook.com`,
        avatar: "https://graph.facebook.com/me/picture?type=large",
      },
      instagram: {
        id: `instagram_${Date.now()}`,
        username: `InstaUser${Math.floor(Math.random() * 1000)}`,
        email: `user${Math.floor(Math.random() * 1000)}@instagram.com`,
        avatar: "https://instagram.com/static/images/anonymousUser.jpg",
      },
      tiktok: {
        id: `tiktok_${Date.now()}`,
        username: `TikTokUser${Math.floor(Math.random() * 1000)}`,
        email: `user${Math.floor(Math.random() * 1000)}@tiktok.com`,
        avatar:
          "https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png",
      },
    }

    return mockData[provider as keyof typeof mockData]
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleSocialLogin} disabled={isLoading}>
      {isLoading ? "Connecting..." : children}
    </Button>
  )
}
