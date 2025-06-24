"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { GoogleLoginButton } from "@/components/google-login-button"
import { useAuth } from "@/contexts/auth-context"
import { loginUser, registerUser } from "@/lib/auth-actions"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const router = useRouter()
  const { refreshUser } = useAuth()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError("")

    try {
      if (isLogin) {
        const result = await loginUser(formData)
        if (result.success) {
          await refreshUser()
          router.push("/")
        } else {
          setError(result.error || "Login failed")
        }
      } else {
        if (!agreedToTerms) {
          setError("You must agree to the Terms and Conditions and Privacy Policy")
          return
        }

        const result = await registerUser(formData)
        if (result.success) {
          await refreshUser()
          router.push("/")
        } else {
          setError(result.error || "Registration failed")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold text-orange-600 mb-4 block">
            JTDRecipe
          </Link>
          <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Welcome back! Please sign in to your account." : "Join our community of recipe lovers."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form action={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" type="text" required placeholder="Choose a username" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="Enter your email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="Enter your password" />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm leading-5">
                  I agree to the{" "}
                  <Link href="/termsandconditions" className="text-orange-600 hover:underline">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-orange-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <GoogleLoginButton />

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
                setAgreedToTerms(false)
              }}
              className="text-sm text-orange-600 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
