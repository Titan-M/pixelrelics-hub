
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, Save, Globe, MapPin, Calendar, Edit, Check, X } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

// Extended Profile Type
interface ExtendedProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  social_links: {
    twitter?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
  } | null;
  preferences: {
    email_notifications?: boolean;
    theme?: string;
    language?: string;
  } | null;
  member_since: string | null;
}

// User Activity Type
interface UserActivity {
  id: string;
  activity_type: string;
  details: any;
  created_at: string;
  game_title?: string;
}

// Helper functions to safely parse JSON
function parseSocialLinks(json: Json | null): ExtendedProfile['social_links'] {
  if (!json) return null;
  
  try {
    if (typeof json === 'string') {
      return JSON.parse(json);
    }
    return json as ExtendedProfile['social_links'];
  } catch (e) {
    console.error('Error parsing social_links:', e);
    return null;
  }
}

function parsePreferences(json: Json | null): ExtendedProfile['preferences'] {
  if (!json) return null;
  
  try {
    if (typeof json === 'string') {
      return JSON.parse(json);
    }
    return json as ExtendedProfile['preferences'];
  } catch (e) {
    console.error('Error parsing preferences:', e);
    return null;
  }
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    website: '',
    social_twitter: '',
    social_github: '',
    social_instagram: '',
    social_linkedin: '',
  });
  
  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        
        if (!user?.id) {
          navigate('/login');
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // Parse JSON fields
        const parsedProfile: ExtendedProfile = {
          ...data,
          social_links: parseSocialLinks(data.social_links),
          preferences: parsePreferences(data.preferences)
        };
        
        setProfile(parsedProfile);
        
        // Initialize form data
        setFormData({
          username: parsedProfile.username || '',
          bio: parsedProfile.bio || '',
          location: parsedProfile.location || '',
          website: parsedProfile.website || '',
          social_twitter: parsedProfile.social_links?.twitter || '',
          social_github: parsedProfile.social_links?.github || '',
          social_instagram: parsedProfile.social_links?.instagram || '',
          social_linkedin: parsedProfile.social_links?.linkedin || '',
        });
      } catch (error: any) {
        toast({
          title: 'Error loading profile',
          description: error.message,
          variant: 'destructive',
        });
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getProfile();
    fetchUserActivities();
  }, [user, navigate]);
  
  const fetchUserActivities = async () => {
    if (!user?.id) return;
    
    try {
      setActivityLoading(true);
      
      // Get user activities
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (activityError) throw activityError;
      
      // Get game titles for activities that have game_id
      const gameIds = activityData
        .filter(activity => activity.game_id && activity.game_id !== '00000000-0000-0000-0000-000000000000')
        .map(activity => activity.game_id);
      
      let gameTitles: Record<string, string> = {};
      
      if (gameIds.length > 0) {
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('id, title')
          .in('id', gameIds);
        
        if (gamesError) throw gamesError;
        
        gameTitles = Object.fromEntries(
          gamesData.map(game => [game.id, game.title])
        );
      }
      
      // Combine activity data with game titles
      const activitiesWithGameTitles = activityData.map(activity => ({
        ...activity,
        game_title: activity.game_id && activity.game_id !== '00000000-0000-0000-0000-000000000000' 
          ? gameTitles[activity.game_id] 
          : undefined
      }));
      
      setActivities(activitiesWithGameTitles);
    } catch (error: any) {
      console.error('Error fetching user activities:', error);
    } finally {
      setActivityLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      
      // Prepare data for update
      const updateData = {
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        social_links: {
          twitter: formData.social_twitter,
          github: formData.social_github,
          instagram: formData.social_instagram,
          linkedin: formData.social_linkedin,
        },
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user?.id);
        
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      // Track user activity
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_activity`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: user?.id,
          game_id: '00000000-0000-0000-0000-000000000000', // Placeholder for non-game activities
          activity_type: 'profile_update',
          details: { fields_updated: Object.keys(updateData) }
        })
      });
      
      // Toggle edit mode off after saving
      setEditMode(false);
      
      // Update activities list
      fetchUserActivities();
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
      console.error('Error updating profile:', error);
    } finally {
      setSaveLoading(false);
    }
  };
  
  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const renderProfileSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-slate-200 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200 animate-pulse rounded"></div>
          <div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
        </div>
      </div>
      <div className="grid gap-4 mt-8">
        <div className="h-8 w-full bg-slate-200 animate-pulse rounded"></div>
        <div className="h-20 w-full bg-slate-200 animate-pulse rounded"></div>
        <div className="h-8 w-full bg-slate-200 animate-pulse rounded"></div>
        <div className="h-8 w-full bg-slate-200 animate-pulse rounded"></div>
      </div>
    </div>
  );
  
  const renderActivitiesSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center p-4 border rounded-md">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-1/3 bg-slate-200 animate-pulse rounded"></div>
            <div className="h-4 w-1/2 bg-slate-200 animate-pulse rounded"></div>
          </div>
          <div className="h-5 w-1/4 bg-slate-200 animate-pulse rounded"></div>
        </div>
      ))}
    </div>
  );
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto pt-6 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            
            {!editMode && (
              <Button 
                variant="outline" 
                onClick={() => setEditMode(true)}
                className="hover-lift transition-all"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile" className="transition-all">Profile</TabsTrigger>
              <TabsTrigger value="activities" className="transition-all">Activities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-8 mt-2">
              {loading ? (
                renderProfileSkeleton()
              ) : (
                <>
                  {/* Profile Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 bg-card rounded-lg shadow-sm">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="text-2xl font-bold">{profile?.username || 'User'}</h2>
                      <p className="text-muted-foreground flex items-center mt-1">
                        <Calendar className="inline-block h-4 w-4 mr-1" />
                        Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* Profile Form */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        {editMode ? (
                          <Input 
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Your username"
                            className="transition-all"
                          />
                        ) : (
                          <p className="p-2 border rounded-md bg-secondary/30">{formData.username || 'Not set'}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        {editMode ? (
                          <div className="relative">
                            <Globe className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="website"
                              name="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              placeholder="https://example.com"
                              className="pl-8 transition-all"
                            />
                          </div>
                        ) : (
                          <p className="p-2 border rounded-md bg-secondary/30 flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formData.website || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      {editMode ? (
                        <Textarea 
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="transition-all"
                        />
                      ) : (
                        <div className="p-3 border rounded-md bg-secondary/30 min-h-[100px] whitespace-pre-wrap">
                          {formData.bio || 'No bio provided'}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        {editMode ? (
                          <div className="relative">
                            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              placeholder="City, Country"
                              className="pl-8 transition-all"
                            />
                          </div>
                        ) : (
                          <p className="p-2 border rounded-md bg-secondary/30 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formData.location || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <h3 className="text-lg font-medium">Social Links</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {editMode ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="social_twitter">Twitter</Label>
                            <Input 
                              id="social_twitter"
                              name="social_twitter"
                              value={formData.social_twitter}
                              onChange={handleInputChange}
                              placeholder="https://twitter.com/username"
                              className="transition-all"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="social_github">GitHub</Label>
                            <Input 
                              id="social_github"
                              name="social_github"
                              value={formData.social_github}
                              onChange={handleInputChange}
                              placeholder="https://github.com/username"
                              className="transition-all"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="social_instagram">Instagram</Label>
                            <Input 
                              id="social_instagram"
                              name="social_instagram"
                              value={formData.social_instagram}
                              onChange={handleInputChange}
                              placeholder="https://instagram.com/username"
                              className="transition-all"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="social_linkedin">LinkedIn</Label>
                            <Input 
                              id="social_linkedin"
                              name="social_linkedin"
                              value={formData.social_linkedin}
                              onChange={handleInputChange}
                              placeholder="https://linkedin.com/in/username"
                              className="transition-all"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-2 border rounded-md bg-secondary/30 flex items-center">
                            <span className="font-medium mr-2">Twitter:</span>
                            <span className="truncate">{formData.social_twitter || 'Not linked'}</span>
                          </div>
                          <div className="p-2 border rounded-md bg-secondary/30 flex items-center">
                            <span className="font-medium mr-2">GitHub:</span>
                            <span className="truncate">{formData.social_github || 'Not linked'}</span>
                          </div>
                          <div className="p-2 border rounded-md bg-secondary/30 flex items-center">
                            <span className="font-medium mr-2">Instagram:</span>
                            <span className="truncate">{formData.social_instagram || 'Not linked'}</span>
                          </div>
                          <div className="p-2 border rounded-md bg-secondary/30 flex items-center">
                            <span className="font-medium mr-2">LinkedIn:</span>
                            <span className="truncate">{formData.social_linkedin || 'Not linked'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {editMode && (
                      <div className="flex justify-end space-x-2 mt-8">
                        <Button 
                          variant="outline"
                          onClick={() => setEditMode(false)}
                          className="transition-all"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={saveLoading}
                          className="transition-all"
                        >
                          {saveLoading ? (
                            <>
                              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="activities" className="mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    A history of your recent activity on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    renderActivitiesSkeleton()
                  ) : activities.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Activity</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activities.map((activity) => (
                            <TableRow key={activity.id} className="transition-all hover-lift">
                              <TableCell className="font-medium">
                                {formatActivityType(activity.activity_type)}
                              </TableCell>
                              <TableCell>
                                {activity.game_title ? (
                                  <span>{activity.game_title}</span>
                                ) : (
                                  <span className="truncate max-w-xs inline-block">
                                    {activity.details && typeof activity.details === 'object' 
                                      ? Object.entries(activity.details)
                                          .map(([key, value]) => {
                                            if (Array.isArray(value)) {
                                              return `${key}: ${value.join(', ')}`;
                                            }
                                            return `${key}: ${value}`;
                                          })
                                          .join(', ')
                                      : JSON.stringify(activity.details)
                                    }
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      No recent activity to display
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
