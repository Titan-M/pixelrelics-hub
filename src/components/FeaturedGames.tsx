
import { useState, useEffect, useRef } from "react";
import { GameCard } from "./GameCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock featured games data
const featuredGames = [
  {
    id: "1",
    title: "Cyberpunk 2077",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 59.99,
    genre: "RPG",
    rating: 4,
    description:
      "Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
  },
  {
    id: "2",
    title: "The Last of Us Part II",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 49.99,
    genre: "Adventure",
    rating: 5,
    description:
      "Five years after their dangerous journey across the post-pandemic United States, Ellie and Joel have settled down in Jackson, Wyoming.",
  },
  {
    id: "3",
    title: "Fortnite",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "Free",
    genre: "Battle Royale",
    rating: 4,
    description:
      "Fortnite is a free-to-play Battle Royale game with numerous game modes for every type of game player.",
  },
];

export function FeaturedGames() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev === featuredGames.length - 1 ? 0 : prev + 1));
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1));
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === activeIndex) return;
    
    setIsTransitioning(true);
    setActiveIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeIndex, isTransitioning]);

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
                style={{ backgroundImage: `url(${game.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto">
                <div className="w-full md:w-1/2 space-y-4 animate-fade-in">
                  <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                    {game.genre}
                  </span>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                    {game.title}
                  </h1>
                  
                  <p className="text-lg text-gray-300 max-w-lg">
                    {game.description}
                  </p>
                  
                  <div className="pt-4 flex items-center space-x-4">
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-white rounded-md px-8"
                    >
                      {game.price === "Free" ? "Play Now" : "Buy Now"}
                    </Button>
                    
                    <span className="text-2xl font-bold text-white">
                      {game.price === "Free" ? "Free" : `$${game.price}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
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
