
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GameCard } from "@/components/GameCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Heart, 
  Package, 
  Clock, 
  ShoppingCart, 
  Settings, 
  Edit, 
  Upload,
  MapPin,
  Globe,
  Loader2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Profile {
  username: string;
  avatar_url?: string;
  created_at: string;
  bio?: string;
  location?: string;
  website?: string;
  member_since?: string;
}

interface Game {
  id: string;
  title: string;
  image_url: string;
  price: number;
  genre: string;
  rating: number;
  description: string;
  is_free: boolean;
}

interface LibraryGame {
  id: string;
  game: Game;
  purchase_date: string;
  is_installed: boolean;
  last_played: string | null;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [ownedGames, setOwnedGames] = useState<LibraryGame[]>([]);
  const [wishlistGames, setWishlistGames] = useState<Game[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<LibraryGame[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("library");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});

  // Form for editing profile
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    async function fetchProfileData() {
      try {
        if (!user?.id) return;
        
        setLoading(true);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        setProfile(profileData);
        setFormData({
          username: profileData.username || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || ''
        });
        
        // Fetch owned games
        const { data: libraryData, error: libraryError } = await supabase
          .from('user_library')
          .select(`
            id,
            purchase_date,
            is_installed,
            last_played,
            games:game_id (
              id,
              title,
              image_url,
              price,
              genre,
              rating,
              description,
              is_free
            )
          `)
          .eq('user_id', user.id)
          .order('purchase_date', { ascending: false });
        
        if (libraryError) throw libraryError;
        
        // Transform data to match LibraryGame type
        const transformedLibraryData = libraryData.map((item: any) => ({
          id: item.id,
          game: item.games,
          purchase_date: item.purchase_date,
          is_installed: item.is_installed,
          last_played: item.last_played
        }));
        
        setOwnedGames(transformedLibraryData);
        setPurchaseHistory(transformedLibraryData);
        
        // Fetch wishlist games
        const { data: wishlistData, error: wishlistError } = await supabase
          .from('wishlist')
          .select(`
            games:game_id (
              id,
              title,
              image_url,
              price,
              genre,
              rating,
              description,
              is_free
            )
          `)
          .eq('user_id', user.id);
          
        if (wishlistError) throw wishlistError;
        
        // Transform wishlist data
        const transformedWishlistData = wishlistData.map((item: any) => item.games);
        setWishlistGames(transformedWishlistData);
        
        // Fetch recent activity
        const { data: activityData, error: activityError } = await supabase
          .from('user_activity')
          .select(`
            id,
            activity_type,
            created_at,
            details,
            games:game_id (
              id,
              title,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (activityError) throw activityError;
        
        setRecentActivity(activityData);
      } catch (error: any) {
        console.error("Error fetching profile data:", error.message);
        toast({
          title: 'Error fetching profile',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
    
    // Set up real-time subscriptions
    if (user?.id) {
      const librarySubscription = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'user_library', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Library change detected:', payload);
            // Refetch library data
            fetchProfileData();
          }
        )
        .subscribe();
        
      const wishlistSubscription = supabase
        .channel('wishlist-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wishlist', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Wishlist change detected:', payload);
            // Refetch wishlist data
            fetchProfileData();
          }
        )
        .subscribe();
        
      const activitySubscription = supabase
        .channel('activity-changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'user_activity', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('New activity detected:', payload);
            // Refetch activity data
            fetchProfileData();
          }
        )
        .subscribe();
        
      // Cleanup subscriptions
      return () => {
        supabase.removeChannel(librarySubscription);
        supabase.removeChannel(wishlistSubscription);
        supabase.removeChannel(activitySubscription);
      };
    }
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || !event.target.files.length) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      setUploadingAvatar(true);
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(filePath);
        
      const avatarUrl = publicUrlData.publicUrl;
      
      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user!.id);
        
      if (updateError) throw updateError;
      
      // Update the local profile state
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEditProfileClick = () => {
    setIsEditingProfile(true);
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          website: formData.website
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local profile state
      setProfile(prev => prev ? { 
        ...prev, 
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website: formData.website
      } : null);
      
      setIsEditingProfile(false);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderActivityItem = (activity: any) => {
    const date = new Date(activity.created_at).toLocaleString();
    
    let activityContent;
    
    switch (activity.activity_type) {
      case 'view':
        activityContent = (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cover rounded" style={{ backgroundImage: `url(${activity.games.image_url})` }}></div>
            <div>
              <p>Viewed game <span className="font-medium">{activity.games.title}</span></p>
              <p className="text-xs text-muted-foreground">{date}</p>
            </div>
          </div>
        );
        break;
      case 'play':
        activityContent = (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cover rounded" style={{ backgroundImage: `url(${activity.games.image_url})` }}></div>
            <div>
              <p>Played <span className="font-medium">{activity.games.title}</span></p>
              <p className="text-xs text-muted-foreground">{date}</p>
            </div>
          </div>
        );
        break;
      case 'purchase':
        activityContent = (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cover rounded" style={{ backgroundImage: `url(${activity.games.image_url})` }}></div>
            <div>
              <p>Purchased <span className="font-medium">{activity.games.title}</span></p>
              <p className="text-xs text-muted-foreground">{date}</p>
            </div>
          </div>
        );
        break;
      default:
        activityContent = (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cover rounded" style={{ backgroundImage: `url(${activity.games.image_url})` }}></div>
            <div>
              <p>{activity.activity_type} <span className="font-medium">{activity.games.title}</span></p>
              <p className="text-xs text-muted-foreground">{date}</p>
            </div>
          </div>
        );
    }
    
    return (
      <div key={activity.id} className="p-3 border-b last:border-b-0">
        {activityContent}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* Profile sidebar */}
            <div className="w-full md:w-80 shrink-0 space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                      <AvatarFallback>{profile?.username?.substring(0, 2) || user?.email?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                    
                    <Button 
                      size="icon" 
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{profile?.username || user?.email}</h2>
                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                  </div>
                  
                  <div className="flex justify-around w-full border-t pt-4">
                    <div className="text-center">
                      <p className="font-bold">{ownedGames.length}</p>
                      <p className="text-xs text-muted-foreground">Games</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{wishlistGames.length}</p>
                      <p className="text-xs text-muted-foreground">Wishlist</p>
                    </div>
                  </div>
                  
                  {!isEditingProfile ? (
                    <Button variant="outline" className="w-full" onClick={handleEditProfileClick}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="w-full space-y-3 pt-2">
                      <Input
                        name="username"
                        value={formData.username}
                        onChange={handleProfileFormChange}
                        placeholder="Username"
                      />
                      <Textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleProfileFormChange}
                        placeholder="Bio"
                        className="h-20"
                      />
                      <Input
                        name="location"
                        value={formData.location}
                        onChange={handleProfileFormChange}
                        placeholder="Location"
                      />
                      <Input
                        name="website"
                        value={formData.website}
                        onChange={handleProfileFormChange}
                        placeholder="Website"
                      />
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={handleSaveProfile}>Save</Button>
                        <Button variant="outline" className="flex-1" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Member since</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.created_at 
                          ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            }) 
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {profile?.location && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{profile.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Website</p>
                        <a 
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-sm text-primary hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Settings</p>
                      <p className="text-sm text-muted-foreground">Account, Privacy, Security</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {profile?.bio && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{profile.bio}</p>
                  </CardContent>
                </Card>
              )}
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
                      {ownedGames.map((item) => (
                        <GameCard
                          key={item.id}
                          id={item.game.id}
                          title={item.game.title}
                          image={item.game.image_url}
                          price={item.game.price}
                          genre={item.game.genre}
                          rating={item.game.rating}
                          description={item.game.description}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-card rounded-lg border">
                      <h3 className="text-xl font-medium mb-2">Your library is empty</h3>
                      <p className="text-muted-foreground mb-4">Explore the store to find your next favorite game.</p>
                      <Button className="bg-primary hover:bg-primary/90" onClick={() => window.location.href = '/store'}>Browse Store</Button>
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
                          image={game.image_url}
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
                      <Button className="bg-primary hover:bg-primary/90" onClick={() => window.location.href = '/store'}>Browse Store</Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="purchases" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Purchase History</h2>
                  {purchaseHistory.length > 0 ? (
                    <div className="bg-card rounded-lg border overflow-hidden">
                      {purchaseHistory.map((item, index) => (
                        <div key={item.id} className={`p-4 flex items-center gap-4 ${index !== purchaseHistory.length - 1 ? 'border-b' : ''}`}>
                          <div className="w-16 h-16 rounded bg-cover bg-center" style={{ backgroundImage: `url(${item.game.image_url})` }}></div>
                          <div className="flex-1">
                            <h3 className="font-medium">{item.game.title}</h3>
                            <p className="text-sm text-muted-foreground">Purchased on {new Date(item.purchase_date).toLocaleDateString()}</p>
                          </div>
                          <div className="font-bold">
                            {item.game.is_free ? 'Free' : `$${item.game.price.toFixed(2)}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg border overflow-hidden">
                      <div className="p-6 text-center">
                        <h3 className="text-xl font-medium mb-2">No purchase history</h3>
                        <p className="text-muted-foreground">You haven't purchased any games yet.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                  {recentActivity.length > 0 ? (
                    <div className="bg-card rounded-lg border overflow-hidden">
                      {recentActivity.map(activity => renderActivityItem(activity))}
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg border overflow-hidden">
                      <div className="p-6 text-center">
                        <h3 className="text-xl font-medium mb-2">No recent activity</h3>
                        <p className="text-muted-foreground">Your recent activity will appear here.</p>
                      </div>
                    </div>
                  )}
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
