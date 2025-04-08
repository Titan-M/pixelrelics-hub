
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { GameCard } from './GameCard';

type Game = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  is_free: boolean;
  genre: string;
  rating: number;
};

export function FeaturedGamesList() {
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        setLoading(true);
        
        // Query for games with high ratings (top 3)
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .order('rating', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        
        if (data) {
          setFeaturedGames(data as Game[]);
        }
      } catch (error) {
        console.error('Error fetching featured games:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedGames();
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Featured Games
          </h2>
          <p className="text-muted-foreground">Check out our featured and top-rated games</p>
        </div>
        <Link to="/store">
          <Button variant="outline" className="mt-4 md:mt-0">
            View All Games
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[500px] rounded-lg bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredGames.map((game) => (
            <GameCard
              key={game.id}
              id={game.id}
              title={game.title}
              image={game.image_url}
              price={game.is_free ? 'Free' : game.price}
              genre={game.genre || 'Unknown'}
              rating={game.rating || 0}
              description={game.description || 'No description available'}
              isFeatured={true}
            />
          ))}
        </div>
      )}
    </section>
  );
}
