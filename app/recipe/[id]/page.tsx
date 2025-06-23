import { Star, Clock, Users, Heart, Bookmark, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"

// Mock data - in a real app, this would come from a database
const recipe = {
  id: 1,
  title: "Perfect Chocolate Chip Cookies",
  author: "BakingMaster",
  authorAvatar: "/placeholder.svg?height=40&width=40",
  rating: 4.9,
  reviews: 234,
  cookTime: "25 min",
  prepTime: "15 min",
  servings: 24,
  difficulty: "Easy",
  views: 1250,
  image: "/placeholder.svg?height=400&width=600",
  category: "Desserts",
  description:
    "These are the most perfect chocolate chip cookies you'll ever make. Crispy edges, chewy centers, and loaded with chocolate chips.",
  ingredients: [
    "2¼ cups all-purpose flour",
    "1 tsp baking soda",
    "1 tsp salt",
    "1 cup butter, softened",
    "¾ cup granulated sugar",
    "¾ cup packed brown sugar",
    "2 large eggs",
    "2 tsp vanilla extract",
    "2 cups chocolate chips",
  ],
  instructions: [
    "Preheat oven to 375°F (190°C).",
    "In a medium bowl, whisk together flour, baking soda, and salt.",
    "In a large bowl, cream together butter and both sugars until light and fluffy.",
    "Beat in eggs one at a time, then stir in vanilla.",
    "Gradually blend in flour mixture.",
    "Stir in chocolate chips.",
    "Drop rounded tablespoons of dough onto ungreased cookie sheets.",
    "Bake for 9-11 minutes or until golden brown.",
    "Cool on baking sheet for 2 minutes; remove to wire rack.",
  ],
  tags: ["cookies", "dessert", "chocolate", "baking", "easy"],
  dateAdded: "2024-01-15",
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

export default function RecipePage() {
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
                <Button size="sm">Add Recipe</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
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
                <Button className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4" />
                </Button>
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
                  {recipe.ingredients.map((ingredient, index) => (
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
                  {recipe.instructions.map((instruction, index) => (
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
  )
}
