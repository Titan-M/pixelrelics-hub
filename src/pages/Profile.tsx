
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
import { RefreshCcw, Save, Globe, MapPin, Calendar } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

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
  }, [user, navigate]);
  
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
      
      // Track user activity - use REST API directly to avoid type issues
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
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
          
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-8">
              {loading ? (
                renderProfileSkeleton()
              ) : (
                <>
                  {/* Profile Header */}
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="text-lg">
                        {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="text-2xl font-bold">{profile?.username || 'User'}</h2>
                      <p className="text-muted-foreground">
                        <Calendar className="inline-block h-4 w-4 mr-1" />
                        Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Profile Form */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="Your username"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://example.com"
                            className="pl-8"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="City, Country"
                            className="pl-8"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-lg font-medium">Social Links</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="social_twitter">Twitter</Label>
                        <Input 
                          id="social_twitter"
                          name="social_twitter"
                          value={formData.social_twitter}
                          onChange={handleInputChange}
                          placeholder="https://twitter.com/username"
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
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={saveLoading}
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
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    A history of your recent activity on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Activity tracking is coming soon!
                  </p>
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
