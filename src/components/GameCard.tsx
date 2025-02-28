
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from '@/integrations/supabase/client';

interface GameCardProps {
  id: string;
  title: string;
  image: string;
  price: number | 'Free';
  genre: string;
  rating: number;
  description: string;
  isFeatured?: boolean;
}

export function GameCard({ id, title, image, price, genre, rating, description, isFeatured = false }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add games to your cart',
      });
      return;
    }
    
    try {
      setIsAddingToCart(true);
      
      // Check if game is already in cart
      const { data: existingCartItem } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_id', id)
        .single();
        
      if (existingCartItem) {
        toast({
          title: 'Game already in cart',
          description: `${title} is already in your cart`,
        });
        return;
      }
      
      // Add to cart
      const { error } = await supabase
        .from('cart')
        .insert({
          user_id: user.id,
          game_id: id
        });
        
      if (error) throw error;
      
      toast({
        title: `${title} added to cart`,
        description: "Item has been added to your shopping cart",
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add games to your wishlist',
      });
      return;
    }
    
    try {
      setIsAddingToWishlist(true);
      
      if (isLiked) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('game_id', id);
          
        if (error) throw error;
        
        setIsLiked(false);
        toast({
          title: `${title} removed from wishlist`,
          description: "Item has been removed from your wishlist",
        });
      } else {
        // Check if already in wishlist
        const { data: existingWishlistItem } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('game_id', id)
          .maybeSingle();
          
        if (existingWishlistItem) {
          setIsLiked(true);
          toast({
            title: 'Game already in wishlist',
            description: `${title} is already in your wishlist`,
          });
          return;
        }
        
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            game_id: id
          });
          
        if (error) throw error;
        
        setIsLiked(true);
        toast({
          title: `${title} added to wishlist`,
          description: "Item has been added to your wishlist",
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  useEffect(() => {
    async function checkWishlist() {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('game_id', id)
          .maybeSingle();
          
        setIsLiked(!!data);
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    }
    
    checkWishlist();
  }, [id, user]);

  const formatPrice = (price: number | 'Free') => {
    if (price === 'Free') return 'Free';
    return `$${price.toFixed(2)}`;
  };

  return (
    <Link 
      to={`/game/${id}`}
      className={`group relative flex flex-col overflow-hidden rounded-lg transition-all duration-300 ${
        isFeatured 
          ? 'h-[500px] md:h-[600px]' 
          : 'h-[350px] md:h-[400px]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10 opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
      
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      <div className="flex-1 flex flex-col justify-end p-6 z-20">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              {genre}
            </span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-4 h-4 ${i < rating ? 'text-yellow-500' : 'text-gray-400'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-sm text-gray-300 line-clamp-2 group-hover:line-clamp-3 transition-all duration-300">
            {description}
          </p>
          
          <div className="pt-2 flex justify-between items-center">
            <span className={`text-lg font-bold ${price === 'Free' ? 'text-green-400' : 'text-white'}`}>
              {formatPrice(price)}
            </span>
            
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-primary/20 transition-all duration-300"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
              </Button>
              
              {price === 'Free' ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full h-9 bg-white/10 backdrop-blur-md border-white/20 hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Get
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-primary/20 transition-all duration-300"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  <ShoppingCart className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isFeatured && (
        <div className="absolute top-6 left-6 z-20">
          <span className="bg-primary px-3 py-1 text-sm font-semibold text-white rounded-md">
            Featured
          </span>
        </div>
      )}
    </Link>
  );
}

// Add missing import
import { useEffect } from "react";
