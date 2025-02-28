
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Heart, ShoppingCart, Clock, Tag, Award, Server, ArrowLeft, Check, Layers, Monitor, Cpu, HardDrive, Play } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GameDetail, parseJsonToSystemRequirements, parseJsonToMediaGallery } from '@/types/supabase-extensions';

export default function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const { toast } = useToast();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    async function fetchGameDetails() {
      try {
        if (!id) return;
        
        setLoading(true);
        
        // Fetch basic game info
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('id', id)
          .single();
          
        if (gameError) throw gameError;
        
        // Fetch detailed game info
        const { data: detailsData, error: detailsError } = await supabase
          .rpc('get_game_details', { game_id: id });
          
        if (detailsError) {
          console.warn('Could not fetch game details using RPC, falling back to direct query:', detailsError);
          
          // Fallback: direct query to game_details table
          const detailsResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/game_details?id=eq.${id}&select=*`, {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Content-Type': 'application/json'
            }
          });
          
          const detailsResult = await detailsResponse.json();
          const gameDetails = detailsResult[0] || {};
          
          // Combine the data
          const gameDetail: GameDetail = {
            ...gameData,
            ...gameDetails,
            system_requirements: parseJsonToSystemRequirements(gameDetails?.system_requirements),
            media_gallery: parseJsonToMediaGallery(gameDetails?.media_gallery)
          };
          
          setGame(gameDetail);
        } else {
          // Process with RPC result
          const combinedData: GameDetail = {
            ...gameData,
            ...(detailsData || {}),
            system_requirements: parseJsonToSystemRequirements(detailsData?.system_requirements),
            media_gallery: parseJsonToMediaGallery(detailsData?.media_gallery)
          };
          
          setGame(combinedData);
        }
        
        // Track this view in user activity if logged in
        if (user) {
          try {
            // Use REST API endpoint instead of supabase client
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_activity`, {
              method: 'POST',
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                user_id: user.id,
                game_id: id,
                activity_type: 'view',
                details: { source: 'game_details_page' }
              })
            });
              
            // Check if game is in user's wishlist
            const { data: wishlistData } = await supabase
              .from('wishlist')
              .select('id')
              .eq('user_id', user.id)
              .eq('game_id', id)
              .maybeSingle();
              
            setIsInWishlist(!!wishlistData);
            
            // Check if game is in user's library
            const { data: libraryData } = await supabase
              .from('user_library')
              .select('id')
              .eq('user_id', user.id)
              .eq('game_id', id)
              .maybeSingle();
              
            setIsInLibrary(!!libraryData);
          } catch (error) {
            console.error('Error with user-specific operations:', error);
          }
        }
      } catch (error: any) {
        console.error('Error fetching game details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load game details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchGameDetails();
  }, [id, user]);
  
  const handleAddToCart = () => {
    if (!game) return;
    
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
  };
  
  const handleAddToWishlist = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add games to your wishlist',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('game_id', id);
          
        if (error) throw error;
        
        setIsInWishlist(false);
        toast({
          title: 'Removed from wishlist',
          description: `${game?.title} removed from your wishlist`,
        });
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            game_id: id
          });
          
        if (error) throw error;
        
        setIsInWishlist(true);
        toast({
          title: 'Added to wishlist',
          description: `${game?.title} added to your wishlist`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleBuyNow = () => {
    if (!game) return;
    
    // First add to cart if not already there
    if (!isInCart(game.id)) {
      handleAddToCart();
    }
    
    // Navigate to checkout
    navigate('/checkout');
  };
  
  const renderSystemRequirements = () => {
    if (!game?.system_requirements) {
      return <p className="text-muted-foreground">System requirements not available</p>;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {game.system_requirements.minimum && (
          <div className="space-y-3">
            <h4 className="font-medium">Minimum Requirements</h4>
            <ul className="space-y-2">
              {game.system_requirements.minimum.os && (
                <li className="flex items-start">
                  <Monitor className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
                  <span><span className="font-medium">OS:</span> {game.system_requirements.minimum.os}</span>
                </li>
              )}
              {game.system_requirements.minimum.processor && (
                <li className="flex items-start">
                  <Cpu className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
                  <span><span className="font-medium">Processor:</span> {game.system_requirements.minimum.processor}</span>
                </li>
              )}
              {game.system_requirements.minimum.memory && (
                <li className="flex items-start">
                  <Layers className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
                  <span><span className="font-medium">Memory:</span> {game.system_requirements.minimum.memory}</span>
                </li>
              )}
              {game.system_requirements.minimum.graphics && (
                <li className="flex items-start">
                  <Server className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
                  <span><span className="font-medium">Graphics:</span> {game.system_requirements.minimum.graphics}</span>
                </li>
              )}
              {game.system_requirements.minimum.storage && (
                <li className="flex items-start">
                  <HardDrive className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
                  <span><span className="font-medium">Storage:</span> {game.system_requirements.minimum.storage}</span>
                </li>
              )}
            </ul>
          </div>
        )}
        
        {game.system_requirements.recommended && (
          <div className="space-y-3">
            <h4 className="font-medium">Recommended Requirements</h4>
            <ul className="space-y-2">
              {game.system_requirements.recommended.os && (
                <li className="flex items-start">
                  <Monitor className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
                  <span><span className="font-medium">OS:</span> {game.system_requirements.recommended.os}</span>
                </li>
              )}
              {game.system_requirements.recommended.processor && (
                <li className="flex items-start">
                  <Cpu className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
                  <span><span className="font-medium">Processor:</span> {game.system_requirements.recommended.processor}</span>
                </li>
              )}
              {game.system_requirements.recommended.memory && (
                <li className="flex items-start">
                  <Layers className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
                  <span><span className="font-medium">Memory:</span> {game.system_requirements.recommended.memory}</span>
                </li>
              )}
              {game.system_requirements.recommended.graphics && (
                <li className="flex items-start">
                  <Server className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
                  <span><span className="font-medium">Graphics:</span> {game.system_requirements.recommended.graphics}</span>
                </li>
              )}
              {game.system_requirements.recommended.storage && (
                <li className="flex items-start">
                  <HardDrive className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
                  <span><span className="font-medium">Storage:</span> {game.system_requirements.recommended.storage}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="h-64 rounded-lg bg-gray-200 animate-pulse mb-4"></div>
          <div className="h-8 w-1/3 bg-gray-200 animate-pulse mb-4"></div>
          <div className="h-4 bg-gray-200 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 animate-pulse"></div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
            <p className="text-muted-foreground mb-6">The game you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/store')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero section */}
        <div 
          className="w-full bg-cover bg-center h-[50vh] relative" 
          style={{ 
            backgroundImage: `url(${game.image_url})`,
            backgroundPosition: 'center 20%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent"></div>
          
          <div className="container mx-auto h-full flex items-end pb-8 relative z-10">
            <div className="max-w-3xl space-y-4">
              <Button 
                variant="outline" 
                className="mb-2" 
                onClick={() => navigate('/store')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
              
              <h1 className="text-4xl md:text-5xl font-bold">{game.title}</h1>
              
              <div className="flex flex-wrap gap-2">
                {game.genre && (
                  <Badge variant="outline" className="text-sm">
                    {game.genre}
                  </Badge>
                )}
                
                {game.developer && (
                  <Badge variant="outline" className="text-sm">
                    Dev: {game.developer}
                  </Badge>
                )}
                
                {game.release_date && (
                  <Badge variant="outline" className="text-sm">
                    Released: {new Date(game.release_date).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Media gallery */}
              {game.media_gallery?.screenshots && game.media_gallery.screenshots.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Screenshots</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {game.media_gallery.screenshots.map((screenshot, index) => (
                      <div 
                        key={index}
                        className="aspect-video rounded-lg overflow-hidden bg-cover bg-center" 
                        style={{ backgroundImage: `url(${screenshot})` }}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Game description */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">About</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {game.description}
                </p>
              </div>
              
              {/* Tabs for more info */}
              <Tabs defaultValue="features">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="system">System Requirements</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="features" className="p-4 border rounded-lg mt-4 space-y-4">
                  {game.features && game.features.length > 0 ? (
                    <ul className="space-y-3">
                      {game.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 mr-2 text-primary shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Features not available</p>
                  )}
                </TabsContent>
                
                <TabsContent value="system" className="p-4 border rounded-lg mt-4">
                  {renderSystemRequirements()}
                </TabsContent>
                
                <TabsContent value="details" className="p-4 border rounded-lg mt-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    {game.developer && (
                      <>
                        <dt className="font-medium text-muted-foreground">Developer</dt>
                        <dd>{game.developer}</dd>
                      </>
                    )}
                    
                    {game.publisher && (
                      <>
                        <dt className="font-medium text-muted-foreground">Publisher</dt>
                        <dd>{game.publisher}</dd>
                      </>
                    )}
                    
                    {game.release_date && (
                      <>
                        <dt className="font-medium text-muted-foreground">Release Date</dt>
                        <dd>{new Date(game.release_date).toLocaleDateString()}</dd>
                      </>
                    )}
                    
                    {game.platform && game.platform.length > 0 && (
                      <>
                        <dt className="font-medium text-muted-foreground">Platforms</dt>
                        <dd>{game.platform.join(', ')}</dd>
                      </>
                    )}
                    
                    {game.genre && (
                      <>
                        <dt className="font-medium text-muted-foreground">Genre</dt>
                        <dd>{game.genre}</dd>
                      </>
                    )}
                    
                    {game.tags && game.tags.length > 0 && (
                      <>
                        <dt className="font-medium text-muted-foreground">Tags</dt>
                        <dd className="flex flex-wrap gap-1">
                          {game.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </dd>
                      </>
                    )}
                  </dl>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar - purchase info */}
            <div className="space-y-6">
              <div className="rounded-lg border p-6 space-y-6 sticky top-4">
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {game.is_free ? 'FREE' : `$${game.price.toFixed(2)}`}
                  </span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-5 h-5 ${i < game.rating ? 'text-yellow-500' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Action buttons */}
                <div className="space-y-3">
                  {isInLibrary ? (
                    <Button className="w-full" onClick={() => navigate('/library')}>
                      <Play className="h-4 w-4 mr-2" />
                      Play Game
                    </Button>
                  ) : (
                    <>
                      {isInCart(game.id) ? (
                        <Button className="w-full" onClick={() => navigate('/cart')}>
                          <Check className="h-4 w-4 mr-2" />
                          View in Cart
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={handleAddToCart}
                          disabled={isInCart(game.id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                      
                      <Button 
                        variant="secondary" 
                        className="w-full"
                        onClick={handleBuyNow}
                      >
                        Buy Now
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className={`w-full ${isInWishlist ? 'text-red-500' : ''}`}
                    onClick={handleAddToWishlist}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                    {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                  </Button>
                </div>
                
                {/* Tags */}
                {game.tags && game.tags.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Tag className="h-4 w-4 mr-2" />
                      <span>Popular tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {game.tags.slice(0, 6).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
