
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock } from 'lucide-react';

type NewsItem = {
  id: string;
  title: string;
  content: string;
  image_url: string;
  category: string;
  is_featured: boolean;
  published_at: string;
};

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('published_at', { ascending: false });

        if (error) {
          throw error;
        }

        setNews(data as NewsItem[]);
        
        // Set featured news
        const featured = data.filter((item: NewsItem) => item.is_featured);
        setFeaturedNews(featured);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((item: NewsItem) => item.category)));
        setCategories(uniqueCategories as string[]);
      } catch (error: any) {
        console.error('Error fetching news:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = activeCategory === 'all' 
    ? news 
    : news.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">News & Announcements</h1>
        
        {/* Featured news */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredNews.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="h-60 bg-cover bg-center" style={{ backgroundImage: `url(${item.image_url})` }}></div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{item.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(item.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl md:text-2xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* News categories and listing */}
        <div className="space-y-6">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="h-40 bg-gray-200 animate-pulse"></div>
                      <CardHeader>
                        <div className="h-5 bg-gray-200 animate-pulse rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border">
                  <h3 className="text-xl font-medium mb-2">No news found</h3>
                  <p className="text-muted-foreground">There are no news articles in this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredNews.map((item) => (
                    <Card key={item.id} className="overflow-hidden flex flex-col">
                      <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${item.image_url})` }}></div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{item.category}</Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(item.published_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow pb-2">
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {item.content}
                        </p>
                      </CardContent>
                      <CardFooter className="text-sm text-primary hover:underline cursor-pointer">
                        Read more
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
