
import { useState, useEffect, useRef } from "react";
import { GameCard } from "./GameCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  const nextSlide = () => {
    if (isTransitioning || games.length === 0) return;
    
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev === games.length - 1 ? 0 : prev + 1));
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isTransitioning || games.length === 0) return;
    
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev === 0 ? games.length - 1 : prev - 1));
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === activeIndex || games.length === 0) return;
    
    setIsTransitioning(true);
    setActiveIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        setLoading(true);
        
        // Fetch games with high ratings (featured games)
        const { data, error: fetchError } = await supabase
          .from('games')
          .select('*')
          .order('rating', { ascending: false })
          .limit(3);
          
        if (fetchError) throw fetchError;
        
        if (data && data.length > 0) {
          setGames(data);
        } else {
          setError("No featured games found");
        }
      } catch (err: any) {
        console.error('Error fetching featured games:', err);
        setError(`Failed to load featured games: ${err.message}`);
        toast({
          title: "Error",
          description: "Failed to load featured games. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedGames();
  }, [toast]);

  useEffect(() => {
    // Only set up timer if we have games
    if (games.length > 0) {
      timerRef.current = window.setInterval(() => {
        nextSlide();
      }, 6000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeIndex, isTransitioning, games.length]);

  if (loading) {
    return (
      <section className="relative overflow-hidden h-[500px] sm:h-[600px] md:h-[700px] flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading featured games...</p>
        </div>
      </section>
    );
  }

  if (error || games.length === 0) {
    return (
      <section className="relative overflow-hidden h-[500px] sm:h-[600px] md:h-[700px] flex items-center justify-center bg-background">
        <div className="text-center max-w-lg px-4">
          <h2 className="text-2xl font-bold mb-4">No Featured Games Available</h2>
          <p className="text-muted-foreground mb-6">
            {error || "We couldn't find any featured games to display at the moment."}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden h-[500px] sm:h-[600px] md:h-[700px]">
      <div 
        className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        <div className="absolute inset-0 flex">
          {games.map((game, index) => (
            <div 
              key={game.id} 
              className="relative min-w-full h-full"
              style={{ left: `${index * 100}%` }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${game.image_url || '/placeholder.svg'})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto">
                <div className="w-full md:w-1/2 space-y-4 animate-fade-in">
                  <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                    {game.genre || 'Featured Game'}
                  </span>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                    {game.title}
                  </h1>
                  
                  <p className="text-lg text-gray-300 max-w-lg">
                    {game.description || 'No description available'}
                  </p>
                  
                  <div className="pt-4 flex items-center space-x-4">
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-white rounded-md px-8"
                    >
                      {game.is_free ? "Play Now" : "Buy Now"}
                    </Button>
                    
                    <span className="text-2xl font-bold text-white">
                      {game.is_free ? "Free" : `$${game.price !== null ? game.price : 0}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
        {games.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? "bg-primary w-6" 
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 z-30"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 z-30"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </Button>
    </section>
  );
}
