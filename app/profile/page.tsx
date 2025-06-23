import { Star, Heart, Bookmark, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

const userRecipes = [
  {
    id: 1,
    title: "Perfect Chocolate Chip Cookies",
    rating: 4.9,
    reviews: 234,
    image: "/placeholder.svg?height=150&width=200",
    status: "published",
  },
  {
    id: 2,
    title: "Homemade Pizza Dough",
    rating: 4.7,
    reviews: 89,
    image: "/placeholder.svg?height=150&width=200",
    status: "published",
  },
]

const savedRecipes = [
  {
    id: 3,
    title: "One-Pot Chicken Alfredo",
    author: "QuickCook",
    rating: 4.8,
    image: "/placeholder.svg?height=150&width=200",
  },
  {
    id: 4,
    title: "Fresh Garden Salad",
    author: "HealthyEats",
    rating: 4.7,
    image: "/placeholder.svg?height=150&width=200",
  },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-orange-600">
              JustTheDamnRecipe
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/add-recipe">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recipe
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt="BakingMaster" />
              <AvatarFallback className="text-2xl">BM</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">BakingMaster</h1>
              <p className="text-gray-600 mb-4">
                Home baker sharing family recipes and baking tips. Love creating sweet treats!
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-xl text-orange-600">12</div>
                  <div className="text-gray-500">Recipes</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-orange-600">1.2k</div>
                  <div className="text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-orange-600">4.8</div>
                  <div className="text-gray-500">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-orange-600">45</div>
                  <div className="text-gray-500">Saved</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">Edit Profile</Button>
              <Button variant="outline">Share</Button>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="my-recipes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-recipes">My Recipes</TabsTrigger>
            <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="my-recipes" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Recipes</h2>
              <Link href="/add-recipe">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Recipe
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRecipes.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={recipe.image || "/placeholder.svg"}
                      alt={recipe.title}
                      width={200}
                      height={150}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">{recipe.status}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{recipe.rating}</span>
                        <span>({recipe.reviews})</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Saved Recipes</h2>
              <p className="text-gray-600">Recipes you've bookmarked for later</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <Image
                        src={recipe.image || "/placeholder.svg"}
                        alt={recipe.title}
                        width={200}
                        height={150}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
                        <Bookmark className="w-4 h-4 fill-orange-600 text-orange-600" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{recipe.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {recipe.author}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-sm">{recipe.rating}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Favorite Recipes</h2>
              <p className="text-gray-600">Your most loved recipes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <Image
                        src={recipe.image || "/placeholder.svg"}
                        alt={recipe.title}
                        width={200}
                        height={150}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{recipe.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {recipe.author}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-sm">{recipe.rating}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
