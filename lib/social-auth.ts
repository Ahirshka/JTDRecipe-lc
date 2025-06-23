export interface SocialProvider {
  id: string
  name: string
  icon: string
  color: string
}

export interface SocialUser {
  id: string
  email: string
  name: string
  avatar?: string
  provider: string
}

export const socialProviders: SocialProvider[] = [
  {
    id: "google",
    name: "Google",
    icon: "🔍",
    color: "bg-red-500 hover:bg-red-600",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "📘",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📷",
    color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "bg-black hover:bg-gray-800",
  },
]

// Mock social login functions - in production, these would integrate with actual OAuth providers
export const initiateSocialLogin = async (provider: string): Promise<SocialUser | null> => {
  // Simulate OAuth flow
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock successful login
      const mockUser: SocialUser = {
        id: `${provider}_${Date.now()}`,
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        avatar: `/placeholder.svg?height=40&width=40`,
        provider: provider,
      }
      resolve(mockUser)
    }, 1500) // Simulate network delay
  })
}

// Google OAuth simulation
export const loginWithGoogle = async (): Promise<SocialUser | null> => {
  try {
    // In production, this would use Google OAuth SDK
    console.log("Initiating Google OAuth...")
    return await initiateSocialLogin("google")
  } catch (error) {
    console.error("Google login failed:", error)
    return null
  }
}

// Facebook OAuth simulation
export const loginWithFacebook = async (): Promise<SocialUser | null> => {
  try {
    // In production, this would use Facebook SDK
    console.log("Initiating Facebook OAuth...")
    return await initiateSocialLogin("facebook")
  } catch (error) {
    console.error("Facebook login failed:", error)
    return null
  }
}

// Instagram OAuth simulation
export const loginWithInstagram = async (): Promise<SocialUser | null> => {
  try {
    // In production, this would use Instagram Basic Display API
    console.log("Initiating Instagram OAuth...")
    return await initiateSocialLogin("instagram")
  } catch (error) {
    console.error("Instagram login failed:", error)
    return null
  }
}

// TikTok OAuth simulation
export const loginWithTikTok = async (): Promise<SocialUser | null> => {
  try {
    // In production, this would use TikTok Login Kit
    console.log("Initiating TikTok OAuth...")
    return await initiateSocialLogin("tiktok")
  } catch (error) {
    console.error("TikTok login failed:", error)
    return null
  }
}

export const getSocialLoginFunction = (provider: string) => {
  switch (provider) {
    case "google":
      return loginWithGoogle
    case "facebook":
      return loginWithFacebook
    case "instagram":
      return loginWithInstagram
    case "tiktok":
      return loginWithTikTok
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
