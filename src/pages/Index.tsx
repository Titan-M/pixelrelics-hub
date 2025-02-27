
import { Navbar } from "@/components/Navbar";
import { FeaturedGames } from "@/components/FeaturedGames";
import { GameGrid } from "@/components/GameGrid";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Mock category data
const categories = [
  { name: "Action", icon: "🎮" },
  { name: "Adventure", icon: "🌍" },
  { name: "RPG", icon: "⚔️" },
  { name: "Strategy", icon: "🧠" },
  { name: "Sports", icon: "⚽" },
  { name: "Simulation", icon: "🏙️" },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="pt-16">
          <FeaturedGames />
        </div>
        
        {/* Categories section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2">Browse Categories</h2>
            <p className="text-muted-foreground">Discover games by genre</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div 
                key={category.name}
                className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card/50 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 cursor-pointer group"
              >
                <span className="text-4xl mb-3">{category.icon}</span>
                <span className="font-medium group-hover:text-primary transition-colors">{category.name}</span>
              </div>
            ))}
          </div>
        </section>
        
        <GameGrid />
        
        {/* Download app section */}
        <section className="py-16 bg-primary/5 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:max-w-xl">
                <h2 className="text-3xl font-bold mb-4">Download Our App</h2>
                <p className="text-muted-foreground mb-6">
                  Get the best gaming experience with our desktop app. Browse and play your games faster, with automatic updates and offline gaming.
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Download Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                  <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-md bg-card shadow-xl transform rotate-3 transition-transform hover:rotate-0 duration-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl">🎮</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
