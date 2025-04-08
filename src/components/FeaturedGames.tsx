import { useState, useEffect, useRef } from "react";
import { GameCard } from "./GameCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Star, Tag, Eye, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

type Game = {
  id: string;
  title: string;
  image_url: string;
  price: number | null;
  is_free: boolean;
  genre: string | null;
  rating: number | null;
  description: string | null;
};

export function FeaturedGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const slideInterval = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedGames();
    startSlideTimer();

    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, []);

  const fetchFeaturedGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .limit(3);

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch featured games",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startSlideTimer = () => {
    slideInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === games.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
  };

  const nextSlide = () => {
    if (slideInterval.current) clearInterval(slideInterval.current);
    setCurrentIndex((prevIndex) => 
      prevIndex === games.length - 1 ? 0 : prevIndex + 1
    );
    startSlideTimer();
  };

  const prevSlide = () => {
    if (slideInterval.current) clearInterval(slideInterval.current);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? games.length - 1 : prevIndex - 1
    );
    startSlideTimer();
  };
  const handleAddToCart = (game: Game) => {
    addToCart({
      id: game.id,
      title: game.title,
      price: game.price || 0,
      image_url: game.image_url,
      is_free: game.is_free,
      genre: game.genre,
      description: game.description,
      rating: game.rating
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="relative h-[600px] overflow-hidden rounded-lg border-2">
      {games.length > 0 && (
        <>
          <div 
            className="absolute inset-0 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {games.map((game, index) => (
              <div
                key={game.id}
                className="absolute w-full h-full"
                style={{ left: `${index * 100}%` }}
              >
                <img
                  src={game.image_url}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    {game.genre && (
                      <Badge variant="secondary" className="text-sm">
                        {game.genre}
                      </Badge>
                    )}
                    {game.rating && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {game.rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader className="p-0">
                    <CardTitle className="text-4xl font-bold text-white mb-2">
                      {game.title}
                    </CardTitle>
                    <CardDescription className="text-white/90 text-lg line-clamp-2">
                      {game.description}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="flex items-center gap-4 mt-4 p-0">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-white" />
                      <span className="text-white text-xl font-semibold">
                        {game.is_free ? "Free" : `$${game.price?.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary"
                        className="gap-2"
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      <Button 
                        variant="default"
                        className="gap-2"
                        onClick={() => handleAddToCart(game)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Buy Now
                      </Button>
                    </div>
                  </CardFooter>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 border-white/20"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 border-white/20"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {games.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
