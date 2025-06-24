import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JTDRecipe - No life-stories, no fluff, just recipes that work",
  description: "Discover amazing recipes without the fluff. Quick, easy, and delicious recipes that actually work.",
  keywords: ["recipes", "cooking", "food", "kitchen", "meals", "ingredients"],
  authors: [{ name: "JTDRecipe Team" }],
  creator: "JTDRecipe",
  publisher: "JTDRecipe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jtdrecipe.com",
    siteName: "JTDRecipe",
    title: "JTDRecipe - No life-stories, no fluff, just recipes that work",
    description: "Discover amazing recipes without the fluff. Quick, easy, and delicious recipes that actually work.",
    images: [
      {
        url: "/placeholder.svg?height=630&width=1200",
        width: 1200,
        height: 630,
        alt: "JTDRecipe - Recipe sharing platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JTDRecipe - No life-stories, no fluff, just recipes that work",
    description: "Discover amazing recipes without the fluff. Quick, easy, and delicious recipes that actually work.",
    creator: "@JTDRecipe",
    images: ["/placeholder.svg?height=630&width=1200"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
