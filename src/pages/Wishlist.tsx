
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GameCard } from '@/components/GameCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

type WishlistGame = {
  id: string;
  title: string;
  image_url: string;
  price: number;
  is_free: boolean;
  genre: string;
  rating: number;
  description: string;
  wishlist_id: string;
};

export default function Wishlist() {
  const [wishlistGames, setWishlistGames] = useState<WishlistGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get wishlist with game details
        const { data, error } = await supabase
          .from('wishlist')
          .select(`
            id,
            game_id,
            games (
              id,
              title,
              image_url,
              price,
              is_free,
              genre,
              rating,
              description
            )
          `)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Format data
        const formattedData = data?.map(item => ({
          wishlist_id: item.id,
          id: item.games.id,
          title: item.games.title,
          image_url: item.games.image_url,
          price: item.games.price,
          is_free: item.games.is_free,
          genre: item.games.genre || 'Unknown',
          rating: item.games.rating || 0,
          description: item.games.description || 'No description available'
        })) || [];
        
        setWishlistGames(formattedData);
      } catch (error: any) {
        console.error('Error fetching wishlist:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your wishlist',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, [user, toast]);
  
  const handleRemoveFromWishlist = async (wishlistId: string, gameTitle: string) => {
    try {
      setRemoveLoading(wishlistId);
      
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);
        
      if (error) throw error;
      
      // Remove from local state
      setWishlistGames(wishlistGames.filter(game => game.wishlist_id !== wishlistId));
      
      toast({
        title: 'Removed from wishlist',
        description: `${gameTitle} has been removed from your wishlist`,
      });
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRemoveLoading(null);
    }
  };
  
  const handleAddToCart = (game: WishlistGame) => {
    addToCart({
      id: game.id,
      title: game.title,
      price: game.price,
      is_free: game.is_free,
      image_url: game.image_url,
      genre: game.genre,
      description: game.description,
      rating: game.rating
    });
    
    toast({
      title: 'Added to cart',
      description: `${game.title} has been added to your cart`,
    });
  };
  
  const handleAddAllToCart = () => {
    wishlistGames.forEach(game => {
      if (!isInCart(game.id)) {
        addToCart({
          id: game.id,
          title: game.title,
          price: game.price,
          is_free: game.is_free,
          image_url: game.image_url,
          genre: game.genre,
          description: game.description,
          rating: game.rating
        });
      }
    });
    
    toast({
      title: 'Added all to cart',
      description: 'All wishlist items have been added to your cart',
    });
    
    navigate('/cart');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4 mt-16">
        <h1 className="text-3xl font-bold mb-4">My Wishlist</h1>
        
        {!user ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg border">
            <h3 className="text-xl font-medium mb-4">Sign in to view your wishlist</h3>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Loading your wishlist...</span>
          </div>
        ) : wishlistGames.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg border">
            <h3 className="text-xl font-medium mb-4">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add games to your wishlist by clicking the heart icon on a game card
            </p>
            <Button onClick={() => navigate('/store')}>Browse Games</Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                {wishlistGames.length} {wishlistGames.length === 1 ? 'game' : 'games'} in your wishlist
              </p>
              <Button onClick={handleAddAllToCart} disabled={wishlistGames.length === 0}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistGames.map((game) => (
                <div key={game.wishlist_id} className="relative group">
                  <GameCard
                    id={game.id}
                    title={game.title}
                    image={game.image_url}
                    price={game.is_free ? 'Free' : game.price}
                    genre={game.genre}
                    rating={game.rating}
                    description={game.description}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    onClick={() => handleRemoveFromWishlist(game.wishlist_id, game.title)}
                    disabled={removeLoading === game.wishlist_id}
                  >
                    {removeLoading === game.wishlist_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
