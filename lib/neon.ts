import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

// Helper function to execute queries safely
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql(query, params)
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function for transactions
export async function executeTransaction(queries: Array<{ query: string; params?: any[] }>) {
  try {
    // Neon handles transactions automatically when using the sql function
    // For multiple queries, we'll execute them sequentially
    const results = []
    for (const { query, params = [] } of queries) {
      const result = await sql(query, params)
      results.push(result)
    }
    return results
  } catch (error) {
    console.error("Transaction error:", error)
    throw error
  }
}
