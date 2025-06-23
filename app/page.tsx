import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <a href="#" className="font-bold text-2xl">
            JustTheDamnRecipe
          </a>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              About
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Recipes
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Blog
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
      </header>

      <main className="container py-10 flex-grow">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4">Find the Damn Recipe, Already!</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Tired of endless scrolling? We cut the fluff, just the recipe.
          </p>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Input type="search" placeholder="Search for a recipe..." className="pr-12" />
              <Button className="absolute top-0 right-0 rounded-l-none h-full">Search</Button>
            </div>
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-2xl font-bold mb-6">Featured Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spaghetti Carbonara</CardTitle>
                <CardDescription>Classic Italian pasta dish.</CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src="https://images.unsplash.com/photo-1607962837359-eb5c1690ca1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Spaghetti Carbonara"
                  width={600}
                  height={400}
                  className="rounded-md object-cover"
                />
              </CardContent>
              <CardFooter>
                <Button>View Recipe</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chocolate Chip Cookies</CardTitle>
                <CardDescription>The perfect homemade cookies.</CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src="https://images.unsplash.com/photo-1558961330-443c9c1c0944?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Chocolate Chip Cookies"
                  width={600}
                  height={400}
                  className="rounded-md object-cover"
                />
              </CardContent>
              <CardFooter>
                <Button>View Recipe</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chicken Stir-Fry</CardTitle>
                <CardDescription>Quick and easy weeknight dinner.</CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Chicken Stir-Fry"
                  width={600}
                  height={400}
                  className="rounded-md object-cover"
                />
              </CardContent>
              <CardFooter>
                <Button>View Recipe</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} JustTheDamnRecipe. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              About
            </a>
            <a href="mailto:contact@justthedamnrecipe.com" className="text-muted-foreground hover:text-foreground">
              Contact
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Privacy
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
