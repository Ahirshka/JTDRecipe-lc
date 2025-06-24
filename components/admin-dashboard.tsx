"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, Ban, CheckCircle, Clock, Search, Eye, UserX, ChefHat, Trash2 } from "lucide-react"
import { secureDB, type SecureUser, type SecureRecipe, type UserRole } from "@/lib/secure-database"

interface AdminDashboardProps {
  currentUser: SecureUser
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [users, setUsers] = useState<SecureUser[]>([])
  const [recipes, setRecipes] = useState<SecureRecipe[]>([])
  const [filteredUsers, setFilteredUsers] = useState<SecureUser[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<SecureRecipe[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [recipeSearchTerm, setRecipeSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<SecureUser | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<SecureRecipe | null>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")
  const [actionReason, setActionReason] = useState("")
  const [suspensionDays, setSuspensionDays] = useState("7")
  const [newRole, setNewRole] = useState<UserRole>("user")
  const [message, setMessage] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    "Appetizers",
    "Main Dishes",
    "Desserts",
    "Salads",
    "Soups",
    "Beverages",
    "Breakfast",
    "Snacks",
  ])
  const [selectedRecipeForCategory, setSelectedRecipeForCategory] = useState<SecureRecipe | null>(null)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [recipeFilter, setRecipeFilter] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, userSearchTerm, filterRole, filterStatus])

  useEffect(() => {
    filterRecipes()
  }, [recipes, recipeSearchTerm, recipeFilter])

  const loadData = async () => {
    try {
      const allUsers = secureDB.getAllUsers(currentUser.id)
      const allRecipes = secureDB.getAllRecipes(currentUser.id)
      setUsers(allUsers)
      setRecipes(allRecipes)
    } catch (error) {
      setMessage("Error loading data: " + (error as Error).message)
    }
  }

  const filterUsers = () => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
      const matchesRole = filterRole === "all" || user.role === filterRole
      const matchesStatus = filterStatus === "all" || user.status === filterStatus

      return matchesSearch && matchesRole && matchesStatus
    })

    setFilteredUsers(filtered)
  }

  const filterRecipes = () => {
    const filtered = recipes.filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(recipeSearchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(recipeSearchTerm.toLowerCase()) ||
        recipe.author_username?.toLowerCase().includes(recipeSearchTerm.toLowerCase())

      const matchesFilter = recipeFilter === "all" || recipe.moderation_status === recipeFilter

      return matchesSearch && matchesFilter
    })

    setFilteredRecipes(filtered)
  }

  const handleUserAction = async (action: string, user: SecureUser) => {
    setSelectedUser(user)
    setActionType(action)
    setActionReason("")
    setSuspensionDays("7")
    setNewRole(user.role)
    setIsActionDialogOpen(true)
  }

  const handleRecipeAction = async (action: string, recipe: SecureRecipe) => {
    setSelectedRecipe(recipe)
    setActionType(action)
    setActionReason("")
    setIsRecipeDialogOpen(true)
  }

  const executeUserAction = async () => {
    if (!selectedUser) return

    try {
      let success = false

      switch (actionType) {
        case "suspend":
          success = await secureDB.suspendUser(
            currentUser.id,
            selectedUser.id,
            actionReason,
            Number.parseInt(suspensionDays),
          )
          break
        case "ban":
          success = await secureDB.banUser(currentUser.id, selectedUser.id, actionReason)
          break
        case "changeRole":
          success = await secureDB.changeUserRole(currentUser.id, selectedUser.id, newRole)
          break
      }

      if (success) {
        setMessage(`User action completed successfully`)
        loadData()
        setIsActionDialogOpen(false)
      } else {
        setMessage("User action failed")
      }
    } catch (error) {
      setMessage("Error: " + (error as Error).message)
    }

    setTimeout(() => setMessage(""), 3000)
  }

  const executeRecipeAction = async () => {
    if (!selectedRecipe) return

    try {
      let success = false

      switch (actionType) {
        case "approve":
          success = await secureDB.moderateRecipe(currentUser.id, selectedRecipe.id, "approved", actionReason)
          break
        case "reject":
          success = await secureDB.moderateRecipe(currentUser.id, selectedRecipe.id, "rejected", actionReason)
          break
        case "delete":
          success = await secureDB.deleteRecipe(currentUser.id, selectedRecipe.id)
          break
      }

      if (success) {
        setMessage(`Recipe action completed successfully`)
        loadData()
        setIsRecipeDialogOpen(false)
      } else {
        setMessage("Recipe action failed")
      }
    } catch (error) {
      setMessage("Error: " + (error as Error).message)
    }

    setTimeout(() => setMessage(""), 3000)
  }

  const canModerate = (targetUser: SecureUser) => {
    const roleHierarchy = { user: 0, moderator: 1, admin: 2, owner: 3 }
    return roleHierarchy[currentUser.role] > roleHierarchy[targetUser.role]
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      case "moderator":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-yellow-100 text-yellow-800"
      case "banned":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getModerationBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    suspendedUsers: users.filter((u) => u.status === "suspended").length,
    bannedUsers: users.filter((u) => u.status === "banned").length,
    newUsersThisWeek: users.filter((u) => {
      const userDate = new Date(u.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return userDate >= weekAgo
    }).length,
    totalRecipes: recipes.length,
    pendingRecipes: recipes.filter((r) => r.moderation_status === "pending").length,
    approvedRecipes: recipes.filter((r) => r.moderation_status === "approved").length,
    rejectedRecipes: recipes.filter((r) => r.moderation_status === "rejected").length,
    socialLogins: users.filter((u) => u.provider !== "email").length,
    verifiedUsers: users.filter((u) => u.is_verified).length,
  }

  const addNewCategory = () => {
    if (newCategoryName.trim() && !availableCategories.includes(newCategoryName.trim())) {
      setAvailableCategories([...availableCategories, newCategoryName.trim()])
      setNewCategoryName("")
      setMessage("Category added successfully")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const updateRecipeCategory = async (recipeId: string, newCategory: string) => {
    try {
      const success = await secureDB.updateRecipe(currentUser.id, recipeId, { category: newCategory })
      if (success) {
        setMessage("Recipe category updated successfully")
        loadData()
        setIsCategoryDialogOpen(false)
      } else {
        setMessage("Failed to update recipe category")
      }
    } catch (error) {
      setMessage("Error: " + (error as Error).message)
    }
    setTimeout(() => setMessage(""), 3000)
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {stats.pendingRecipes > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have {stats.pendingRecipes} recipe{stats.pendingRecipes !== 1 ? "s" : ""} waiting for review
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const recipesTab = document.querySelector('[data-value="recipes"]') as HTMLElement
                if (recipesTab) {
                  recipesTab.click()
                  setTimeout(() => {
                    setRecipeFilter("pending")
                  }, 100)
                }
              }}
            >
              Review Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Recipes</p>
                <p className="text-2xl font-bold">{stats.totalRecipes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => {
            // Switch to recipes tab and filter to pending
            const recipesTab = document.querySelector('[value="recipes"]') as HTMLElement
            if (recipesTab) {
              recipesTab.click()
              // Filter to show only pending recipes
              setTimeout(() => {
                setRecipeSearchTerm("")
                setFilteredRecipes(recipes.filter((r) => r.moderation_status === "pending"))
              }, 100)
            }
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingRecipes}</p>
                <p className="text-xs text-blue-600 mt-1">Click to review →</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">New This Week</p>
                <p className="text-2xl font-bold">{stats.newUsersThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="recipes">Recipe Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.username}</h3>
                          {user.is_verified && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {user.warning_count > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {user.warning_count} warnings
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                          <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                          {user.provider && user.provider !== "email" && (
                            <Badge variant="outline" className="text-xs">
                              {user.provider}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-gray-600">
                        <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                        {user.last_login_at && <p>Last login: {new Date(user.last_login_at).toLocaleDateString()}</p>}
                      </div>

                      {canModerate(user) && (
                        <div className="flex gap-1">
                          {user.status !== "banned" && (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction("ban", user)}>
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}

                          {user.status !== "suspended" && (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction("suspend", user)}>
                              <UserX className="w-4 h-4" />
                            </Button>
                          )}

                          {currentUser.role === "owner" && (
                            <Button size="sm" variant="outline" onClick={() => handleUserAction("changeRole", user)}>
                              <Shield className="w-4 h-4" />
                            </Button>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>User Details: {user.username}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Email</Label>
                                    <p className="text-sm">{user.email}</p>
                                  </div>
                                  <div>
                                    <Label>Role</Label>
                                    <p className="text-sm">{user.role}</p>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <p className="text-sm">{user.status}</p>
                                  </div>
                                  <div>
                                    <Label>Login Attempts</Label>
                                    <p className="text-sm">{user.login_attempts}</p>
                                  </div>
                                  <div>
                                    <Label>Email Verified</Label>
                                    <p className="text-sm">{user.email_verified ? "Yes" : "No"}</p>
                                  </div>
                                  <div>
                                    <Label>Provider</Label>
                                    <p className="text-sm">{user.provider}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search recipes..."
                      value={recipeSearchTerm}
                      onChange={(e) => setRecipeSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={recipeFilter} onValueChange={setRecipeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recipes</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ChefHat className="w-8 h-8 text-gray-400" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{recipe.title}</h3>
                          <Badge className={getModerationBadgeColor(recipe.moderation_status)}>
                            {recipe.moderation_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">by {recipe.author_username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{recipe.category}</Badge>
                          <Badge variant="outline">{recipe.difficulty}</Badge>
                          <span className="text-xs text-gray-500">{recipe.view_count} views</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-gray-600">
                        <p>Created: {new Date(recipe.created_at).toLocaleDateString()}</p>
                        <p>
                          Rating: {recipe.rating}/5 ({recipe.review_count} reviews)
                        </p>
                      </div>

                      <div className="flex gap-1">
                        {recipe.moderation_status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleRecipeAction("approve", recipe)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRecipeAction("reject", recipe)}>
                              <UserX className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        <Button size="sm" variant="outline" onClick={() => handleRecipeAction("delete", recipe)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        {(currentUser.role === "admin" || currentUser.role === "owner") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRecipeForCategory(recipe)
                              setIsCategoryDialogOpen(true)
                            }}
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Recipe Details: {recipe.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Description</Label>
                                <p className="text-sm">{recipe.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Category</Label>
                                  <p className="text-sm">{recipe.category}</p>
                                </div>
                                <div>
                                  <Label>Difficulty</Label>
                                  <p className="text-sm">{recipe.difficulty}</p>
                                </div>
                                <div>
                                  <Label>Prep Time</Label>
                                  <p className="text-sm">{recipe.prep_time_minutes} minutes</p>
                                </div>
                                <div>
                                  <Label>Cook Time</Label>
                                  <p className="text-sm">{recipe.cook_time_minutes} minutes</p>
                                </div>
                              </div>
                              {recipe.moderation_notes && (
                                <div>
                                  <Label>Moderation Notes</Label>
                                  <p className="text-sm">{recipe.moderation_notes}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Database Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Recipes</p>
                      <p className="text-2xl font-bold">{stats.totalRecipes}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Security Settings</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">• Password hashing: bcrypt with 12 salt rounds</p>
                    <p className="text-sm text-gray-600">• Session timeout: 7 days</p>
                    <p className="text-sm text-gray-600">• Max login attempts: 5</p>
                    <p className="text-sm text-gray-600">• Account lockout duration: 30 minutes</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Category Management</h3>
                  {(currentUser.role === "admin" || currentUser.role === "owner") && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="New category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addNewCategory()}
                        />
                        <Button onClick={addNewCategory}>Add Category</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "suspend" && "Suspend User"}
              {actionType === "ban" && "Ban User"}
              {actionType === "changeRole" && "Change User Role"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedUser && (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.username} />
                  <AvatarFallback>{selectedUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{selectedUser.username}</span>
              </div>
            )}

            {actionType === "changeRole" && (
              <div>
                <Label>New Role</Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {currentUser.role === "owner" && <SelectItem value="owner">Owner</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            )}

            {actionType === "suspend" && (
              <div>
                <Label>Suspension Duration (days)</Label>
                <Input
                  type="number"
                  value={suspensionDays}
                  onChange={(e) => setSuspensionDays(e.target.value)}
                  min="1"
                  max="365"
                />
              </div>
            )}

            {(actionType === "suspend" || actionType === "ban") && (
              <div>
                <Label>Reason</Label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter reason for this action..."
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={executeUserAction}
                disabled={(actionType === "suspend" || actionType === "ban") && !actionReason.trim()}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipe Action Dialog */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Recipe"}
              {actionType === "reject" && "Reject Recipe"}
              {actionType === "delete" && "Delete Recipe"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRecipe && (
              <div className="flex items-center gap-2">
                <ChefHat className="w-8 h-8" />
                <span className="font-medium">{selectedRecipe.title}</span>
              </div>
            )}

            <div>
              <Label>Notes</Label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter notes for this action..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRecipeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={executeRecipeAction}>Confirm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Recipe Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRecipeForCategory && (
              <div className="flex items-center gap-2">
                <ChefHat className="w-8 h-8" />
                <span className="font-medium">{selectedRecipeForCategory.title}</span>
              </div>
            )}
            <div>
              <Label>Category</Label>
              <Select
                defaultValue={selectedRecipeForCategory?.category}
                onValueChange={(value) =>
                  selectedRecipeForCategory && updateRecipeCategory(selectedRecipeForCategory.id, value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
