"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { saveRecipe } from "@/lib/recipes"
import { addRecipeToUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AddRecipePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    servings: "",
    prepTime: "",
    cookTime: "",
  })

  const [ingredients, setIngredients] = useState([""])
  const [instructions, setInstructions] = useState([""])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const addIngredient = () => {
    setIngredients([...ingredients, ""])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients]
    updated[index] = value
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions]
    updated[index] = value
    setInstructions(updated)
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to publish a recipe.",
        variant: "destructive",
      })
      return
    }

    if (!formData.title.trim() || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the recipe title and category.",
        variant: "destructive",
      })
      return
    }

    const filteredIngredients = ingredients.filter((ing) => ing.trim() !== "")
    const filteredInstructions = instructions.filter((inst) => inst.trim() !== "")

    if (filteredIngredients.length === 0 || filteredInstructions.length === 0) {
      toast({
        title: "Missing recipe details",
        description: "Please add at least one ingredient and one instruction.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create the recipe
      const newRecipe = saveRecipe({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        difficulty: formData.difficulty || "Easy",
        servings: Number.parseInt(formData.servings) || 1,
        prepTime: formData.prepTime ? `${formData.prepTime} min` : "0 min",
        cookTime: formData.cookTime ? `${formData.cookTime} min` : "0 min",
        ingredients: filteredIngredients,
        instructions: filteredInstructions,
        tags: tags,
        author: user.username,
        authorId: user.id,
        image: "/placeholder.svg?height=400&width=600", // Default placeholder image
      })

      // Add recipe to user's myRecipes list
      addRecipeToUser(user.id, newRecipe.id)

      toast({
        title: "Recipe published!",
        description: "Your recipe has been successfully published and is now visible to everyone.",
      })

      // Redirect to the new recipe page
      router.push(`/recipe/${newRecipe.id}`)
    } catch (error) {
      console.error("Error publishing recipe:", error)
      toast({
        title: "Error publishing recipe",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to add a recipe.</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Recipe</h1>
          <p className="text-gray-600">Share your favorite recipe with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter recipe title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your recipe"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Appetizers">Appetizers</SelectItem>
                      <SelectItem value="Main Dishes">Main Dishes</SelectItem>
                      <SelectItem value="Desserts">Desserts</SelectItem>
                      <SelectItem value="Salads">Salads</SelectItem>
                      <SelectItem value="Soups">Soups</SelectItem>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    placeholder="4"
                    value={formData.servings}
                    onChange={(e) => handleInputChange("servings", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prep-time">Prep Time (minutes)</Label>
                  <Input
                    id="prep-time"
                    type="number"
                    placeholder="15"
                    value={formData.prepTime}
                    onChange={(e) => handleInputChange("prepTime", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cook-time">Cook Time (minutes)</Label>
                  <Input
                    id="cook-time"
                    type="number"
                    placeholder="30"
                    value={formData.cookTime}
                    onChange={(e) => handleInputChange("cookTime", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Image */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Upload a photo of your finished dish</p>
                <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 10MB (Coming soon)</p>
                <Button type="button" variant="outline" disabled>
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder={`Ingredient ${index + 1}`}
                      className="flex-1"
                    />
                    {ingredients.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => removeIngredient(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                      {index + 1}
                    </span>
                    <Textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      className="flex-1"
                      rows={2}
                    />
                    {instructions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeInstruction(index)}
                        className="mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addInstruction} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer">
                        {tag}
                        <X className="w-3 h-3 ml-1" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish Recipe"}
            </Button>
            <Button type="button" variant="outline" disabled>
              Save as Draft
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
