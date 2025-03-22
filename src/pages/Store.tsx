import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Search, Star, ShoppingCart, Check, Info, Heart, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Game, useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Store() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 70]); // Assuming max price is 70
  const [genres, setGenres] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
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
        
        const uniqueGenres = Array.from(new Set(data.map((game: any) => game.genre)));
        setGenres(uniqueGenres.filter(Boolean) as string[]);
        
        if (user) {
          const { data: wishlistData, error: wishlistError } = await supabase
            .from('wishlist')
            .select('game_id')
            .eq('user_id', user.id);
            
          if (!wishlistError && wishlistData) {
            setWishlistItems(wishlistData.map(item => item.game_id));
          }
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGames();
  }, [user]);
  
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || game.genre === selectedGenre;
    const matchesPrice = 
      (game.is_free || (game.price !== null && game.price >= priceRange[0] && game.price <= priceRange[1]));
    
    return matchesSearch && matchesGenre && matchesPrice;
  });
  
  const handleAddToCart = (game: Game) => {
    addToCart(game);
    toast({
      title: 'Added to cart',
      description: `${game.title} has been added to your cart`,
    });
  };
  
  const handleToggleWishlist = async (gameId: string, title: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add games to your wishlist',
        variant: 'destructive',
      });
      return;
    }
    
    setWishlistLoading(gameId);
    
    try {
      const isInWishlist = wishlistItems.includes(gameId);
      
      if (isInWishlist) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('game_id', gameId);
          
        setWishlistItems(wishlistItems.filter(id => id !== gameId));
        
        toast({
          title: 'Removed from wishlist',
          description: `${title} has been removed from your wishlist`,
        });
      } else {
        await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            game_id: gameId
          });
          
        setWishlistItems([...wishlistItems, gameId]);
        
        toast({
          title: 'Added to wishlist',
          description: `${title} has been added to your wishlist`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setWishlistLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Browse Games</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-lg border p-4 shadow-sm">
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
            
            <div className="bg-card rounded-lg border p-4 shadow-sm">
              <h2 className="font-medium mb-4">Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm">Genre</label>
                  <Select
                    value={selectedGenre || "all"}
                    onValueChange={(value) => setSelectedGenre(value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
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
                  <div className="px-2 py-4">
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
          
          <div className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden shadow-sm">
                    <div className="h-40 bg-muted animate-pulse"></div>
                    <CardHeader>
                      <div className="h-6 bg-muted animate-pulse rounded mb-2"></div>
                      <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 bg-muted animate-pulse rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg border">
                <Search className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No games found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <Card key={game.id} className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow border-muted">
                    <div className="relative">
                      <Link to={`/game/${game.id}`} className="block h-40 bg-cover bg-center relative group">
                        <div 
                          className="absolute inset-0 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${game.image_url})` }}
                        ></div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <Button variant="secondary" size="sm" className="gap-1">
                            <Info className="h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </Link>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={wishlistLoading === game.id}
                        className={`absolute top-2 right-2 z-10 ${wishlistItems.includes(game.id) ? 'text-red-500' : 'text-white'} hover:bg-black/30`}
                        onClick={() => handleToggleWishlist(game.id, game.title)}
                      >
                        {wishlistLoading === game.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Heart className={`h-5 w-5 ${wishlistItems.includes(game.id) ? 'fill-current' : ''}`} />
                        )}
                      </Button>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <Link to={`/game/${game.id}`}>
                        <CardTitle className="line-clamp-1 hover:text-primary transition-colors">
                          {game.title}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center text-sm text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < (game.rating || 0) ? 'fill-yellow-500' : 'fill-gray-300 text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-1 text-muted-foreground">{game.rating || 0}/5</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <Badge variant="outline" className="mb-2">
                        {game.genre || 'Misc'}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {game.description || 'No description available.'}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <div className="font-bold">
                        {game.is_free ? (
                          <span className="text-green-500">Free</span>
                        ) : (
                          <span>${(game.price || 0).toFixed(2)}</span>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleAddToCart(game)}
                        disabled={isInCart(game.id)}
                        variant={isInCart(game.id) ? "secondary" : "default"}
                        className="transition-all"
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
