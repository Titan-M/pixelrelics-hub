import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GameCard } from "@/components/GameCard";
import { User, Heart, Package, Clock, ShoppingCart, Settings, Edit } from "lucide-react";

interface Profile {
  username: string;
  avatar_url?: string;
  created_at: string;
}

// Mock data for user profile
const userData = {
  username: "GamerPro123",
  email: "gamer@example.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
  memberSince: "January 2021",
  gamesOwned: 12,
  friendsCount: 28,
};

// Mock data for games
const ownedGames = [
  {
    id: "1",
    title: "Cyberpunk 2077",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 59.99,
    genre: "RPG",
    rating: 4,
    description: "Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
  },
  {
    id: "2",
    title: "The Last of Us Part II",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 49.99,
    genre: "Adventure",
    rating: 5,
    description: "Five years after their dangerous journey across the post-pandemic United States, Ellie and Joel have settled down in Jackson, Wyoming.",
  },
];

const wishlistGames = [
  {
    id: "3",
    title: "Elden Ring",
    image: "https://images.unsplash.com/photo-1527346842894-892dcef7fc72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 59.99,
    genre: "Action RPG",
    rating: 5,
    description: "Elden Ring is an action RPG which takes place in the Lands Between, sometime after the Shattering of the titular Elden Ring.",
  },
];

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("library");

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!user?.id) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        toast({
          title: 'Error fetching profile',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* Profile sidebar */}
            <div className="w-full md:w-80 shrink-0 space-y-6">
              <div className="bg-card rounded-lg border p-6 flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData.avatar} alt={userData.username} />
                    <AvatarFallback>{userData.username.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <h2 className="text-xl font-bold">{userData.username}</h2>
                  <p className="text-muted-foreground text-sm">{userData.email}</p>
                </div>
                
                <div className="flex justify-around w-full border-t pt-4">
                  <div className="text-center">
                    <p className="font-bold">{userData.gamesOwned}</p>
                    <p className="text-xs text-muted-foreground">Games</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{userData.friendsCount}</p>
                    <p className="text-xs text-muted-foreground">Friends</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </div>
              
              <div className="bg-card rounded-lg border overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Account Info</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Member since</p>
                      <p className="text-sm text-muted-foreground">{userData.memberSince}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Settings</p>
                      <p className="text-sm text-muted-foreground">Account, Privacy, Security</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="flex-1 space-y-6">
              <Tabs 
                defaultValue="library" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="library" className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Library</span>
                  </TabsTrigger>
                  <TabsTrigger value="wishlist" className="flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                  </TabsTrigger>
                  <TabsTrigger value="purchases" className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Purchases</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Activity</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="library" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Your Game Library</h2>
                  {ownedGames.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {ownedGames.map((game) => (
                        <GameCard
                          key={game.id}
                          id={game.id}
                          title={game.title}
                          image={game.image}
                          price={game.price}
                          genre={game.genre}
                          rating={game.rating}
                          description={game.description}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-card rounded-lg border">
                      <h3 className="text-xl font-medium mb-2">Your library is empty</h3>
                      <p className="text-muted-foreground mb-4">Explore the store to find your next favorite game.</p>
                      <Button className="bg-primary hover:bg-primary/90">Browse Store</Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="wishlist" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
                  {wishlistGames.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {wishlistGames.map((game) => (
                        <GameCard
                          key={game.id}
                          id={game.id}
                          title={game.title}
                          image={game.image}
                          price={game.price}
                          genre={game.genre}
                          rating={game.rating}
                          description={game.description}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-card rounded-lg border">
                      <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
                      <p className="text-muted-foreground mb-4">Save games you're interested in for later.</p>
                      <Button className="bg-primary hover:bg-primary/90">Browse Store</Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="purchases" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Purchase History</h2>
                  <div className="bg-card rounded-lg border overflow-hidden">
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-medium mb-2">No recent purchases</h3>
                      <p className="text-muted-foreground">Your purchase history will appear here.</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                  <div className="bg-card rounded-lg border overflow-hidden">
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-medium mb-2">No recent activity</h3>
                      <p className="text-muted-foreground">Your recent activity will appear here.</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
