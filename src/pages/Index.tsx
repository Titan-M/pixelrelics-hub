
import { Navbar } from "@/components/Navbar";
import { FeaturedGames } from "@/components/FeaturedGames";
import { GameGrid } from "@/components/GameGrid";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Trophy, Zap, Gamepad2, BarChart4 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

// Type definition for news
type NewsItem = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  is_featured: boolean | null;
  image_url: string | null;
  published_at: string;
};

// Type for categories with improved consistency
type Category = {
  name: string;
  icon: JSX.Element;
  color: string;
};

export default function Index() {
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch categories based on available game genres
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('genre')
          .not('genre', 'is', null);
          
        if (error) throw error;
        
        // Extract unique genres
        const uniqueGenres = Array.from(new Set(data.map(item => item.genre)));
        
        // Map genres to categories with icons
        const categoryIcons = [
          { icon: <Zap className="h-8 w-8" />, color: "from-red-500/20 to-orange-500/20" },
          { icon: <Gamepad2 className="h-8 w-8" />, color: "from-blue-500/20 to-cyan-500/20" },
          { icon: <Trophy className="h-8 w-8" />, color: "from-purple-500/20 to-pink-500/20" },
          { icon: <BarChart4 className="h-8 w-8" />, color: "from-green-500/20 to-emerald-500/20" },
          { icon: <TrendingUp className="h-8 w-8" />, color: "from-yellow-500/20 to-amber-500/20" },
          { icon: <Gamepad2 className="h-8 w-8" />, color: "from-indigo-500/20 to-violet-500/20" }
        ];
        
        const mappedCategories = uniqueGenres.map((genre, index) => ({
          name: genre as string,
          icon: categoryIcons[index % categoryIcons.length].icon,
          color: categoryIcons[index % categoryIcons.length].color
        }));
        
        setCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to some default categories if there's an error
        setCategories([
          { name: "Action", icon: <Zap className="h-8 w-8" />, color: "from-red-500/20 to-orange-500/20" },
          { name: "Adventure", icon: <Gamepad2 className="h-8 w-8" />, color: "from-blue-500/20 to-cyan-500/20" },
          { name: "RPG", icon: <Trophy className="h-8 w-8" />, color: "from-purple-500/20 to-pink-500/20" },
          { name: "Strategy", icon: <BarChart4 className="h-8 w-8" />, color: "from-green-500/20 to-emerald-500/20" },
          { name: "Sports", icon: <TrendingUp className="h-8 w-8" />, color: "from-yellow-500/20 to-amber-500/20" },
          { name: "Simulation", icon: <Gamepad2 className="h-8 w-8" />, color: "from-indigo-500/20 to-violet-500/20" }
        ]);
      }
    };

    const fetchFeaturedNews = async () => {
      try {
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
        setIsLoading(false);
      }
    };
    
    fetchCategories();
    fetchFeaturedNews();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="pt-16">
          <FeaturedGames />
        </div>
        
        {/* Categories section with enhanced design */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Browse Categories</h2>
            <p className="text-muted-foreground">Discover games by genre</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div 
                key={category.name}
                className={`flex flex-col items-center justify-center p-6 rounded-lg border bg-gradient-to-br ${category.color} hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group`}
              >
                <div className="text-primary mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <span className="font-medium group-hover:text-primary transition-colors">{category.name}</span>
              </div>
            ))}
          </div>
        </section>
        
        {/* Featured News Section */}
        {featuredNews.length > 0 && (
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
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-card border rounded-lg overflow-hidden animate-pulse">
                      <div className="h-48 bg-muted"></div>
                      <div className="p-5">
                        <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
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
      </main>
      
      <Footer />
    </div>
  );
}
