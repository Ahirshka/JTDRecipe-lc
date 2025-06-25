"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, Users, ChefHat } from "lucide-react"
import { moderateRecipe, getPendingRecipes, type Recipe } from "@/lib/recipe-actions"
import { toast } from "@/hooks/use-toast"

export function AdminModerationPanel() {
  const [pendingRecipes, setPendingRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [moderating, setModerating] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [moderationNotes, setModerationNotes] = useState("")

  useEffect(() => {
    loadPendingRecipes()
  }, [])

  const loadPendingRecipes = async () => {
    try {
      setLoading(true)
      const recipes = await getPendingRecipes()
      setPendingRecipes(recipes)
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

      const result = await moderateRecipe(recipeId, status, moderationNotes)

      if (result.success) {
        toast({
          title: "Success",
          description: `Recipe ${status} successfully`,
        })

        // Remove the moderated recipe from the list
        setPendingRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId))
        setSelectedRecipe(null)
        setModerationNotes("")
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
          <div className="text-center py-8 text-muted-foreground">No pending recipes to moderate</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRecipes.map((recipe) => (
              <Dialog key={recipe.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {recipe.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {recipe.author_username}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {recipe.prep_time_minutes + recipe.cook_time_minutes}m
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline">{recipe.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{recipe.title}</DialogTitle>
                    <DialogDescription>
                      Submitted by {recipe.author_username} • {recipe.category} • {recipe.difficulty}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {recipe.image_url && (
                      <img
                        src={recipe.image_url || "/placeholder.svg"}
                        alt={recipe.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{recipe.description || "No description provided"}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Prep Time:</span>
                        <p>{recipe.prep_time_minutes} minutes</p>
                      </div>
                      <div>
                        <span className="font-medium">Cook Time:</span>
                        <p>{recipe.cook_time_minutes} minutes</p>
                      </div>
                      <div>
                        <span className="font-medium">Servings:</span>
                        <p>{recipe.servings}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="moderation-notes">Moderation Notes (Optional)</Label>
                      <Textarea
                        id="moderation-notes"
                        placeholder="Add notes for the recipe author..."
                        value={moderationNotes}
                        onChange={(e) => setModerationNotes(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleModeration(recipe.id, "approved")}
                        disabled={moderating === recipe.id}
                        className="flex-1"
                      >
                        {moderating === recipe.id ? "Processing..." : "Approve"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleModeration(recipe.id, "rejected")}
                        disabled={moderating === recipe.id}
                        className="flex-1"
                      >
                        {moderating === recipe.id ? "Processing..." : "Reject"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
