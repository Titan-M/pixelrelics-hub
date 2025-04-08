
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Game } from "@/context/CartContext";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedGames() {
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        setLoading(true);
        // Fetch top rated games (rating of 4 or higher)
        const { data, error } = await supabase
          .from("games")
          .select("*")
          .order("rating", { ascending: false })
          .gte("rating", 4)
          .limit(3);

        if (error) throw error;
        
        if (data && data.length > 0) {
          setFeaturedGames(data);
        } else {
          console.log("No featured games found");
        }
      } catch (error) {
        console.error("Error fetching featured games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedGames();
  }, []);

  const nextSlide = () => {
    if (isTransitioning || featuredGames.length <= 1) return;
    
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev === featuredGames.length - 1 ? 0 : prev + 1));
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isTransitioning || featuredGames.length <= 1) return;
    
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1));
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === activeIndex || featuredGames.length <= 1) return;
    
    setIsTransitioning(true);
    setActiveIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Clear interval when the component unmounts or when the dependencies change
  useEffect(() => {
    if (featuredGames.length > 1) {
      timerRef.current = window.setInterval(() => {
        nextSlide();
      }, 6000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeIndex, isTransitioning, featuredGames.length]);

  if (loading) {
    return (
      <section className="relative overflow-hidden h-[500px] sm:h-[600px] md:h-[700px] bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      </section>
    );
  }

  if (featuredGames.length === 0) {
    return (
      <section className="relative overflow-hidden h-[500px] sm:h-[600px] md:h-[700px] bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-3xl font-bold text-white mb-4">No Featured Games</h2>
          <p className="text-gray-300">Check back soon for our featured games selection!</p>
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
          {featuredGames.map((game, index) => (
            <div 
              key={game.id} 
              className="relative min-w-full h-full"
              style={{ left: `${index * 100}%` }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${game.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto">
                <div className="w-full md:w-1/2 space-y-4 animate-fade-in">
                  <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                    {game.genre || "Featured"}
                  </span>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                    {game.title}
                  </h1>
                  
                  <p className="text-lg text-gray-300 max-w-lg">
                    {game.description || "Experience this exciting game from our featured collection."}
                  </p>
                  
                  <div className="pt-4 flex items-center space-x-4">
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-white rounded-md px-8"
                    >
                      {game.is_free ? "Play Now" : "Buy Now"}
                    </Button>
                    
                    <span className="text-2xl font-bold text-white">
                      {game.is_free ? "Free" : `$${(game.price || 0).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {featuredGames.length > 1 && (
        <>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
            {featuredGames.map((_, index) => (
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
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 z-30"
            onClick={nextSlide}
            disabled={isTransitioning}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>
        </>
      )}
    </section>
  );
}
