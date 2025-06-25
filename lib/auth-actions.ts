import { createClient } from "./supabase/server"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  const email = String(formData.get("email"))
  const password = String(formData.get("password"))

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      },
    })

    if (error) {
      console.error("Registration error:", error)

      // Fix: Safe error message extraction
      let errorMessage = "Registration failed"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Registration error:", error)

    // Fix: Safe error message extraction
    let errorMessage = "Registration failed"
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === "string") {
      errorMessage = error
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email"))
  const password = String(formData.get("password"))

  const supabase = createClient()

  try {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error:", error)

      // Fix: Safe error message extraction
      let errorMessage = "Login failed"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Login error:", error)

    // Fix: Safe error message extraction
    let errorMessage = "Login failed"
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === "string") {
      errorMessage = error
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return redirect("/")
}
