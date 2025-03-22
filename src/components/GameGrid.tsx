
import { useState, useEffect } from "react";
import { GameCard } from "./GameCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from "lucide-react";

type Game = {
  id: string;
  title: string;
  image_url: string;
  price: number;
  is_free: boolean;
  genre: string;
  rating: number;
  description: string;
};

export function GameGrid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [maxPrice, setMaxPrice] = useState(100);

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          // Format the data
          const formattedGames = data.map(game => ({
            id: game.id,
            title: game.title,
            image_url: game.image_url || 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            price: game.price || 0,
            is_free: game.is_free || false,
            genre: game.genre || 'Unknown',
            rating: game.rating || 0,
            description: game.description || 'No description available',
          }));
          
          setGames(formattedGames);
          
          // Find the maximum price for the slider
          const highestPrice = Math.max(...formattedGames.map(game => 
            game.is_free ? 0 : (game.price || 0)
          ));
          setMaxPrice(highestPrice > 0 ? highestPrice : 100);
          setPriceRange([0, highestPrice > 0 ? highestPrice : 100]);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGames();
  }, []);

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (game.genre && game.genre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = 
      (activeTab === "all") ||
      (activeTab === "free" && game.is_free) ||
      (activeTab === "paid" && !game.is_free);
    
    const gamePrice = game.is_free ? 0 : (game.price || 0);
    const matchesPriceRange = gamePrice >= priceRange[0] && gamePrice <= priceRange[1];
    
    return matchesSearch && matchesTab && matchesPriceRange;
  });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-2">Discover Games</h2>
        <p className="text-muted-foreground">Explore our collection of games</p>
      </div>
      
      <div className="flex flex-col space-y-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All Games</TabsTrigger>
              <TabsTrigger value="free">Free Games</TabsTrigger>
              <TabsTrigger value="paid">Paid Games</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              className="pl-10 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="px-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <span className="font-medium">Price Range</span>
            </div>
            <div className="text-sm">
              ${priceRange[0]} - ${priceRange[1]}
            </div>
          </div>
          <Slider 
            defaultValue={[0, maxPrice]} 
            max={maxPrice} 
            step={1} 
            value={priceRange}
            onValueChange={setPriceRange}
            className="w-full"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading games...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                image={game.image_url}
                price={game.is_free ? 'Free' : game.price}
                genre={game.genre}
                rating={game.rating}
                description={game.description}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium mb-2">No games found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
