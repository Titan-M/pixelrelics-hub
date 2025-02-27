
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, StarIcon, ShoppingCart, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Game, useCart } from '@/context/CartContext';
import { Separator } from '@/components/ui/separator';

export default function Store() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 70]); // Assuming max price is 70
  const [genres, setGenres] = useState<string[]>([]);
  const { addToCart, isInCart } = useCart();
  
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        setGames(data as Game[]);
        
        // Extract all unique genres
        const uniqueGenres = Array.from(new Set(data.map((game: any) => game.genre)));
        setGenres(uniqueGenres as string[]);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGames();
  }, []);
  
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || game.genre === selectedGenre;
    const matchesPrice = 
      (game.is_free || game.price >= priceRange[0]) && 
      (game.is_free || game.price <= priceRange[1]);
    
    return matchesSearch && matchesGenre && matchesPrice;
  });
  
  const handleAddToCart = (game: Game) => {
    addToCart(game);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Store</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Search and filters */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-lg border p-4">
              <h2 className="font-medium mb-4">Search</h2>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-4">
              <h2 className="font-medium mb-4">Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm">Genre</label>
                  <Select
                    value={selectedGenre || ""}
                    onValueChange={(value) => setSelectedGenre(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Genres</SelectItem>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm">Price Range</label>
                  <div className="px-2">
                    <Slider 
                      defaultValue={[0, 70]} 
                      max={70} 
                      step={1} 
                      value={priceRange}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Game grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-40 bg-gray-200 animate-pulse"></div>
                    <CardHeader>
                      <div className="h-6 bg-gray-200 animate-pulse rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 bg-gray-200 animate-pulse rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No games found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <Card key={game.id} className="overflow-hidden flex flex-col">
                    <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${game.image_url})` }}></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-1">{game.title}</CardTitle>
                      <div className="flex items-center text-sm text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 fill-current ${i < game.rating ? '' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-1 text-muted-foreground">{game.rating}/5</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <Badge variant="outline" className="mb-2">
                        {game.genre}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {game.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <div className="font-bold">
                        {game.is_free ? 'Free' : `$${game.price.toFixed(2)}`}
                      </div>
                      <Button 
                        onClick={() => handleAddToCart(game)}
                        disabled={isInCart(game.id)}
                        variant={isInCart(game.id) ? "secondary" : "default"}
                      >
                        {isInCart(game.id) ? <Check className="h-4 w-4 mr-2" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
                        {isInCart(game.id) ? 'In Cart' : 'Add to Cart'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
