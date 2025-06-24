"use client"

import { Star, Clock, Users, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getRecipeById } from "@/lib/recipes"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { RecipeShare } from "@/components/recipe-share"
import { SocialMeta } from "@/components/social-meta"

export default function RecipePage() {
  const params = useParams()
  const recipeId = params.id as string
  const { user, isAuthenticated, toggleFavorite, rateRecipe, getUserRating, isFavorited } = useAuth()

  const [recipe, setRecipe] = useState<any>(null)
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const recipeData = getRecipeById(recipeId)
    setRecipe(recipeData)

    if (isAuthenticated && recipeData) {
      setUserRating(getUserRating(recipeId))
      setIsFavorite(isFavorited(recipeId))
    }
  }, [recipeId, isAuthenticated, getUserRating, isFavorited])

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) return
    const newFavoriteStatus = toggleFavorite(recipeId)
    setIsFavorite(newFavoriteStatus)
  }

  const handleRating = (rating: number) => {
    if (!isAuthenticated) return
    rateRecipe(recipeId, rating)
    setUserRating(rating)
    setIsRatingDialogOpen(false)
  }

  if (!recipe) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Recipe not found</div>
  }

  const reviews = [
    {
      id: 1,
      user: "CookieLover23",
      avatar: "/placeholder.svg?height=32&width=32",
      rating: 5,
      comment: "These turned out amazing! My family loved them.",
      date: "2024-01-20",
    },
    {
      id: 2,
      user: "HomeBaker",
      avatar: "/placeholder.svg?height=32&width=32",
      rating: 5,
      comment: "Perfect recipe, followed exactly and they were delicious!",
      date: "2024-01-18",
    },
  ]

  return (
    <>
      <SocialMeta
        title={recipe.title}
        description={recipe.description}
        image={recipe.image}
        url={`${typeof window !== "undefined" ? window.location.href : ""}`}
        author={recipe.author}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-orange-600">
                JTDRecipe
              </Link>
              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <Link href="/profile">
                    <Button variant="outline" size="sm">
                      Profile
                    </Button>
                  </Link>
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

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Recipe Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <Image
                  src={recipe.image || "/placeholder.svg"}
                  alt={recipe.title}
                  width={600}
                  height={400}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
              </div>

              <div className="md:w-1/2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{recipe.category}</Badge>
                  <Badge variant="outline">{recipe.difficulty}</Badge>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>

                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={recipe.authorAvatar || "/placeholder.svg"} alt={recipe.author} />
                    <AvatarFallback>{recipe.author[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{recipe.author}</p>
                    <p className="text-sm text-gray-500">Recipe creator</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.floor(recipe.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{recipe.rating}</span>
                  <span className="text-gray-500">({recipe.reviews} reviews)</span>
                </div>

                {userRating && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">Your rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= userRating ? "fill-orange-400 text-orange-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-gray-600 mb-6">{recipe.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                    <p className="text-sm font-medium">Prep: {recipe.prepTime}</p>
                    <p className="text-sm font-medium">Cook: {recipe.cookTime}</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                    <p className="text-sm font-medium">Servings</p>
                    <p className="text-sm font-medium">{recipe.servings}</p>
                  </div>
                  <div className="text-center">
                    <Star className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                    <p className="text-sm font-medium">Difficulty</p>
                    <p className="text-sm font-medium">{recipe.difficulty}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isAuthenticated ? (
                    <>
                      <Button
                        className="flex-1"
                        variant={isFavorite ? "default" : "outline"}
                        onClick={handleFavoriteToggle}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                        {isFavorite ? "Favorited" : "Favorite"}
                      </Button>
                      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Star className="w-4 h-4 mr-2" />
                            {userRating ? "Update Rating" : "Rate"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rate this recipe</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center gap-2 py-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRating(star)}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    star <= (userRating || 0)
                                      ? "fill-orange-400 text-orange-400"
                                      : "text-gray-300 hover:text-orange-400"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <Link href="/login" className="flex-1">
                      <Button className="w-full">
                        <Heart className="w-4 h-4 mr-2" />
                        Login to Save
                      </Button>
                    </Link>
                  )}
                  <RecipeShare
                    recipe={{
                      id: recipeId,
                      title: recipe.title,
                      description: recipe.description,
                      image: recipe.image,
                      author: recipe.author,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Ingredients */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-sm">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Instructions */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction: string, index: number) => (
                      <li key={index} className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-relaxed pt-1">{instruction}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Reviews ({recipe.reviews})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.user} />
                        <AvatarFallback>{review.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{review.user}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
