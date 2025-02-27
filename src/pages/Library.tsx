
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Search, Download, Clock, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type LibraryGame = {
  id: string;
  game: {
    id: string;
    title: string;
    image_url: string;
    genre: string;
  };
  is_installed: boolean;
  last_played: string | null;
};

export default function Library() {
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchLibrary();
  }, [user]);

  useEffect(() => {
    if (!games) return;
    
    const filtered = games.filter(game => {
      const matchesSearch = game.game.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'installed' && game.is_installed) || 
        (activeTab === 'not-installed' && !game.is_installed);
      
      return matchesSearch && matchesTab;
    });
    
    setFilteredGames(filtered);
  }, [games, searchTerm, activeTab]);

  const fetchLibrary = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_library')
        .select(`
          id,
          is_installed,
          last_played,
          games:game_id (
            id,
            title,
            image_url,
            genre
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Transform the data to match the LibraryGame type
      const transformedData = data.map((item: any) => ({
        id: item.id,
        game: item.games,
        is_installed: item.is_installed,
        last_played: item.last_played,
      }));
      
      setGames(transformedData);
    } catch (error: any) {
      console.error('Error fetching library:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleInstallGame = async (gameId: string, isInstalled: boolean) => {
    if (!user) return;
    
    try {
      // Find the library item for this game
      const libraryItem = games.find(item => item.game.id === gameId);
      if (!libraryItem) return;
      
      if (!isInstalled) {
        // Start fake installation
        toast.info('Starting download...', {
          description: `Preparing to download game files`,
        });
        
        // Simulate download progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress >= 100) {
            clearInterval(interval);
            completeInstallation(libraryItem.id);
          }
        }, 500);
      } else {
        // Uninstall game
        const { error } = await supabase
          .from('user_library')
          .update({ is_installed: false })
          .eq('id', libraryItem.id);
          
        if (error) throw error;
        
        toast.success('Game uninstalled', {
          description: `Game has been uninstalled successfully`,
        });
        
        // Refresh library
        fetchLibrary();
      }
    } catch (error: any) {
      toast.error('Error updating game', {
        description: error.message,
      });
    }
  };
  
  const completeInstallation = async (libraryItemId: string) => {
    try {
      const { error } = await supabase
        .from('user_library')
        .update({ is_installed: true })
        .eq('id', libraryItemId);
        
      if (error) throw error;
      
      toast.success('Game installed', {
        description: `Game has been installed successfully`,
      });
      
      // Refresh library
      fetchLibrary();
    } catch (error: any) {
      toast.error('Error installing game', {
        description: error.message,
      });
    }
  };
  
  const playGame = async (gameId: string) => {
    if (!user) return;
    
    try {
      // Find the library item for this game
      const libraryItem = games.find(item => item.game.id === gameId);
      if (!libraryItem) return;
      
      // Update last played time
      const { error } = await supabase
        .from('user_library')
        .update({ last_played: new Date().toISOString() })
        .eq('id', libraryItem.id);
        
      if (error) throw error;
      
      toast.info('Launching game', {
        description: `Enjoy your gaming session!`,
      });
      
      // Refresh library
      fetchLibrary();
    } catch (error: any) {
      toast.error('Error launching game', {
        description: error.message,
      });
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Library</h1>
        
        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in library..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All Games</TabsTrigger>
                <TabsTrigger value="installed">Installed</TabsTrigger>
                <TabsTrigger value="not-installed">Not Installed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-40 bg-gray-200 animate-pulse"></div>
                  <CardContent className="mt-3">
                    <div className="h-5 bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-gray-200 animate-pulse rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border">
              <h3 className="text-xl font-medium mb-2">Your library is empty</h3>
              <p className="text-muted-foreground mb-6">You haven't purchased any games yet</p>
              <Button onClick={() => navigate('/store')}>Visit Store</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredGames.map((item) => (
                <Card key={item.id} className="overflow-hidden flex flex-col">
                  <div 
                    className="h-40 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${item.game.image_url})` }}
                  ></div>
                  <CardContent className="pt-4 pb-2 flex-grow">
                    <CardTitle className="line-clamp-1 mb-2">{item.game.title}</CardTitle>
                    <Badge variant="outline" className="mb-2">
                      {item.game.genre}
                    </Badge>
                    
                    {item.last_played && (
                      <div className="flex items-center mt-3 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Last played: {new Date(item.last_played).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {item.is_installed ? (
                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="default" 
                          className="flex-1"
                          onClick={() => playGame(item.game.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => toggleInstallGame(item.game.id, true)}
                        >
                          Uninstall
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => toggleInstallGame(item.game.id, false)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Install
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
