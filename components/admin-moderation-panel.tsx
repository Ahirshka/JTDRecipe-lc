"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, ChefHat, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PendingRecipe {
  id: string
  title: string
  description?: string
  author_id: string
  author_username: string
  category: string
  difficulty: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url?: string
  ingredients: Array<{ ingredient: string; amount: string; unit: string }>
  instructions: Array<{ instruction: string; step_number: number }>
  tags: string[]
  moderation_status: string
  created_at: string
}

export function AdminModerationPanel() {
  const [pendingRecipes, setPendingRecipes] = useState<PendingRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [moderating, setModerating] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<PendingRecipe | null>(null)
  const [moderationNotes, setModerationNotes] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  useEffect(() => {
    loadPendingRecipes()
  }, [])

  const loadPendingRecipes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/pending-recipes")

      if (response.ok) {
        const data = await response.json()
        setPendingRecipes(data.recipes || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load pending recipes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to load pending recipes:", error)
      toast({
        title: "Error",
        description: "Failed to load pending recipes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = async (recipeId: string, status: "approved" | "rejected") => {
    try {
      setModerating(recipeId)

      const response = await fetch("/api/admin/moderate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId,
          status,
          notes: moderationNotes,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `Recipe ${status} successfully`,
        })

        // Remove the moderated recipe from the list
        setPendingRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId))
        setSelectedRecipe(null)
        setModerationNotes("")
        setViewDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to moderate recipe",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Moderation error:", error)
      toast({
        title: "Error",
        description: "Failed to moderate recipe",
        variant: "destructive",
      })
    } finally {
      setModerating(null)
    }
  }

  const openRecipeView = (recipe: PendingRecipe) => {
    setSelectedRecipe(recipe)
    setModerationNotes("")
    setViewDialogOpen(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recipe Moderation</CardTitle>
          <CardDescription>Loading pending recipes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Recipe Moderation
          </CardTitle>
          <CardDescription>
            {pendingRecipes.length} recipe{pendingRecipes.length !== 1 ? "s" : ""} pending approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRecipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p>No recipes pending moderation at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingRecipes.map((recipe) => (
                <Card key={recipe.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {recipe.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {recipe.author_username}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.prep_time_minutes + recipe.cook_time_minutes}m
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        <Badge variant="outline">{recipe.category}</Badge>
                        <Badge variant="outline">{recipe.difficulty}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{recipe.servings} servings</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openRecipeView(recipe)} className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipe View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              {selectedRecipe?.title}
            </DialogTitle>
            <DialogDescription>
              Submitted by {selectedRecipe?.author_username} • {selectedRecipe?.category} • {selectedRecipe?.difficulty}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {selectedRecipe && (
              <div className="space-y-6">
                {/* Recipe Image */}
                {selectedRecipe.image_url && (
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={selectedRecipe.image_url || "/placeholder.svg"}
                      alt={selectedRecipe.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Recipe Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="font-semibold text-lg">{selectedRecipe.prep_time_minutes}</div>
                    <div className="text-sm text-muted-foreground">Prep Time (min)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{selectedRecipe.cook_time_minutes}</div>
                    <div className="text-sm text-muted-foreground">Cook Time (min)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{selectedRecipe.servings}</div>
                    <div className="text-sm text-muted-foreground">Servings</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{selectedRecipe.difficulty}</div>
                    <div className="text-sm text-muted-foreground">Difficulty</div>
                  </div>
                </div>

                {/* Description */}
                {selectedRecipe.description && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Description
                    </h4>
                    <p className="text-muted-foreground bg-gray-50 p-3 rounded-lg">{selectedRecipe.description}</p>
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <h4 className="font-semibold mb-3">Ingredients</h4>
                  <div className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">
                          {ingredient.amount} {ingredient.unit}
                        </span>
                        <span>{ingredient.ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold mb-3">Instructions</h4>
                  <div className="space-y-3">
                    {selectedRecipe.instructions
                      .sort((a, b) => a.step_number - b.step_number)
                      .map((instruction, index) => (
                        <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {instruction.step_number}
                          </div>
                          <p className="text-gray-700 leading-relaxed">{instruction.instruction}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Tags */}
                {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Moderation Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="moderation-notes">Moderation Notes (Optional)</Label>
                    <Textarea
                      id="moderation-notes"
                      placeholder="Add notes for the recipe author..."
                      value={moderationNotes}
                      onChange={(e) => setModerationNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleModeration(selectedRecipe.id, "approved")}
                      disabled={moderating === selectedRecipe.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {moderating === selectedRecipe.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Recipe
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleModeration(selectedRecipe.id, "rejected")}
                      disabled={moderating === selectedRecipe.id}
                      className="flex-1"
                    >
                      {moderating === selectedRecipe.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Recipe
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
