"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface SocialLoginButtonProps {
  provider: {
    id: string
    name: string
    icon: string
    color: string
    logo?: string
  }
  onLogin: (provider: string) => Promise<void>
  disabled?: boolean
}

export function SocialLoginButton({ provider, onLogin, disabled }: SocialLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onLogin(provider.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className={`w-full relative overflow-hidden ${provider.color} text-white border-0 hover:text-white`}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : provider.logo ? (
        <Image
          src={provider.logo || "/placeholder.svg"}
          alt={`${provider.name} logo`}
          width={20}
          height={20}
          className="mr-2"
        />
      ) : (
        <span className="text-lg mr-2">{provider.icon}</span>
      )}
      {isLoading ? "Connecting..." : `Continue with ${provider.name}`}
    </Button>
  )
}
