
import { Navbar } from "@/components/Navbar";
import { FeaturedGames } from "@/components/FeaturedGames";
import { GameGrid } from "@/components/GameGrid";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Trophy, Zap, Gamepad2, BarChart4 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// Type definitions
type NewsItem = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  is_featured: boolean | null;
  image_url: string | null;
  published_at: string;
};

type Category = {
  name: string;
  icon: JSX.Element;
  color: string;
};

// Category icons mapping
const categoryIcons = {
  "Action": <Zap className="h-8 w-8" />,
  "Adventure": <Gamepad2 className="h-8 w-8" />,
  "RPG": <Trophy className="h-8 w-8" />,
  "Strategy": <BarChart4 className="h-8 w-8" />,
  "Sports": <TrendingUp className="h-8 w-8" />,
  "Simulation": <Gamepad2 className="h-8 w-8" />,
};

// Category colors mapping
const categoryColors = {
  "Action": "from-red-500/20 to-orange-500/20",
  "Adventure": "from-blue-500/20 to-cyan-500/20",
  "RPG": "from-purple-500/20 to-pink-500/20",
  "Strategy": "from-green-500/20 to-emerald-500/20",
  "Sports": "from-yellow-500/20 to-amber-500/20",
  "Simulation": "from-indigo-500/20 to-violet-500/20",
};

export default function Index() {
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        setIsNewsLoading(true);
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('is_featured', true)
          .limit(3);
          
        if (error) throw error;
        setFeaturedNews(data as NewsItem[]);
      } catch (error) {
        console.error('Error fetching featured news:', error);
      } finally {
        setIsNewsLoading(false);
      }
    };
    
    const fetchGameCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        // Get all unique genres from games table
        const { data, error } = await supabase
          .from('games')
          .select('genre')
          .not('genre', 'is', null)
          .order('genre');
          
        if (error) throw error;
        
        // Extract unique genres
        const uniqueGenres = [...new Set(data.map(game => game.genre))];
        
        // Map genres to categories with icons and colors
        const mappedCategories = uniqueGenres.map(genre => ({
          name: genre,
          icon: categoryIcons[genre as keyof typeof categoryIcons] || <Gamepad2 className="h-8 w-8" />,
          color: categoryColors[genre as keyof typeof categoryColors] || "from-gray-500/20 to-gray-500/20"
        }));
        
        setCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching game categories:', error);
        // Fallback to some default categories if we can't fetch from the database
        setCategories([
          { name: "Action", icon: <Zap className="h-8 w-8" />, color: "from-red-500/20 to-orange-500/20" },
          { name: "Adventure", icon: <Gamepad2 className="h-8 w-8" />, color: "from-blue-500/20 to-cyan-500/20" },
          { name: "RPG", icon: <Trophy className="h-8 w-8" />, color: "from-purple-500/20 to-pink-500/20" },
          { name: "Strategy", icon: <BarChart4 className="h-8 w-8" />, color: "from-green-500/20 to-emerald-500/20" },
          { name: "Sports", icon: <TrendingUp className="h-8 w-8" />, color: "from-yellow-500/20 to-amber-500/20" },
          { name: "Simulation", icon: <Gamepad2 className="h-8 w-8" />, color: "from-indigo-500/20 to-violet-500/20" },
        ]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    
    fetchFeaturedNews();
    fetchGameCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="pt-16">
          <FeaturedGames />
        </div>
        
        {/* Categories section with dynamic data */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Browse Categories</h2>
            <p className="text-muted-foreground">Discover games by genre</p>
          </div>
          
          {isCategoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.name}
                  to={`/store?genre=${category.name}`}
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border bg-gradient-to-br ${category.color} hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group`}
                >
                  <div className="text-primary mb-3 transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">{category.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
        
        {/* Featured News Section */}
        {(featuredNews.length > 0 || isNewsLoading) && (
          <section className="py-12 bg-black/5 border-y">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Featured News</h2>
                  <p className="text-muted-foreground">Latest updates from the gaming world</p>
                </div>
                <Link to="/news">
                  <Button variant="outline" className="mt-4 md:mt-0">
                    View All News
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isNewsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-card border rounded-lg overflow-hidden animate-pulse">
                      <Skeleton className="h-48" />
                      <div className="p-5">
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-4" />
                        <Skeleton className="h-3 w-full mb-2" />
                        <Skeleton className="h-3 w-5/6" />
                      </div>
                    </div>
                  ))
                ) : (
                  featuredNews.map((news) => (
                    <div key={news.id} className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                      <div 
                        className="h-48 bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${news.image_url})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        {news.category && (
                          <span className="absolute bottom-4 left-4 bg-primary/90 text-white text-xs px-2 py-1 rounded">
                            {news.category}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {news.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-3">{news.content}</p>
                        <div className="mt-4 text-xs text-muted-foreground">
                          {new Date(news.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
        
        <GameGrid />
        
        {/* Download app section with enhanced design */}
        <section className="py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:max-w-xl">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Download Our App</h2>
                <p className="text-muted-foreground mb-6">
                  Get the best gaming experience with our desktop app. Browse and play your games faster, with automatic updates and offline gaming.
                </p>
                <Button className="group">
                  Download Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center animate-pulse">
                  <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-md bg-card shadow-xl transform rotate-3 transition-transform hover:rotate-0 duration-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Gamepad2 className="h-20 w-20 text-primary/70" />
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
