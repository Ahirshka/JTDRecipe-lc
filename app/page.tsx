"use client"

import { Search, Star, Clock, Eye, TrendingUp, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"

const featuredRecipes = [
  {
    id: 1,
    title: "Perfect Chocolate Chip Cookies",
    author: "BakingMaster",
    rating: 4.9,
    reviews: 234,
    cookTime: "25 min",
    views: 1250,
    image: "/placeholder.svg?height=200&width=300",
    category: "Desserts",
  },
  {
    id: 2,
    title: "One-Pot Chicken Alfredo",
    author: "QuickCook",
    rating: 4.8,
    reviews: 189,
    cookTime: "30 min",
    views: 980,
    image: "/placeholder.svg?height=200&width=300",
    category: "Main Dishes",
  },
  {
    id: 3,
    title: "Fresh Garden Salad",
    author: "HealthyEats",
    rating: 4.7,
    reviews: 156,
    cookTime: "10 min",
    views: 750,
    image: "/placeholder.svg?height=200&width=300",
    category: "Salads",
  },
]

const categories = [
  { name: "Recently Added", icon: Clock, count: 45 },
  { name: "Top Rated", icon: Star, count: 23 },
  { name: "Most Viewed", icon: Eye, count: 67 },
  { name: "Trending", icon: TrendingUp, count: 12 },
]

export default function HomePage() {
  const { user, isAuthenticated, logout, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-orange-600">
              JTDRecipe
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <Link href="/add-recipe">
                  <Button size="sm">Add Recipe</Button>
                </Link>
              )}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      {user?.avatar ? (
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.username}
                          className="w-4 h-4 rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      {user?.username}
                      {user?.role !== "user" && (
                        <Badge variant="outline" className="text-xs ml-1">
                          {user?.role}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    {hasPermission(user?.role || "user", "moderator") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Just the damn recipe.</h1>
          <p className="text-xl text-gray-600 mb-8">No life-stories, no fluff, just recipes that work.</p>
          {isAuthenticated && <p className="text-lg text-orange-600 mb-4">Welcome back, {user?.username}!</p>}

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search for recipes..."
              className="pl-10 pr-4 py-3 text-lg rounded-full border-2 border-gray-200 focus:border-orange-500"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full">Search</Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.name} href={`/category/${category.name.toLowerCase().replace(" ", "-")}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <category.icon className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} recipes</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Recipes</h2>
            <Link href="/recipes">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRecipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <Image
                      src={recipe.image || "/placeholder.svg"}
                      alt={recipe.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-white text-gray-900">{recipe.category}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">by {recipe.author}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{recipe.rating}</span>
                        <span>({recipe.reviews})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.cookTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{recipe.views}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-4">JustTheDamnRecipe</h3>
          <p className="text-gray-400 mb-4">Simple recipes, no nonsense.</p>
          <div className="flex justify-center gap-6">
            <Link href="/about" className="text-gray-400 hover:text-white">
              About
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">
              Contact
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
