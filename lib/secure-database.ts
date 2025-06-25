import { getErrorMessage } from "./error-utils"

export interface SecureUser {
  id: string
  username: string
  role: string
}

// In-memory database for demonstration purposes.  In a real application,
// this would be replaced with a connection to a real database.
const users: SecureUser[] = [
  { id: "1", username: "admin", role: "admin" },
  { id: "2", username: "user1", role: "user" },
  { id: "3", username: "user2", role: "user" },
]

export async function getSecureUsers(): Promise<SecureUser[]> {
  try {
    return users
  } catch (error) {
    console.error("Error fetching users:", getErrorMessage(error))
    throw new Error(`Failed to fetch users: ${getErrorMessage(error)}`)
  }
}

export async function getSecureUserById(userId: string): Promise<SecureUser | undefined> {
  try {
    return users.find((user) => user.id === userId)
  } catch (error) {
    console.error("Error fetching user by ID:", getErrorMessage(error))
    throw new Error(`Failed to fetch user by ID: ${getErrorMessage(error)}`)
  }
}

export async function updateUserRole(userId: string, role: string): Promise<boolean> {
  try {
    const userIndex = users.findIndex((user) => user.id === userId)
    if (userIndex === -1) {
      return false // User not found
    }

    users[userIndex] = { ...users[userIndex], role }
    return true
  } catch (error) {
    console.error("Error updating user role:", getErrorMessage(error))
    throw new Error(`Failed to update user role: ${getErrorMessage(error)}`)
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const userIndex = users.findIndex((user) => user.id === userId)
    if (userIndex === -1) {
      return false // User not found
    }

    users.splice(userIndex, 1)
    return true
  } catch (error) {
    console.error("Error deleting user:", getErrorMessage(error))
    throw new Error(`Failed to delete user: ${getErrorMessage(error)}`)
  }
}
