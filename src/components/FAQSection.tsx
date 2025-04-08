
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order_number: number | null;
};

export function FAQSection() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        
        // Query to fetch FAQs
        let query = supabase
          .from('faq')
          .select('*');
          
        // Add category filter if one is selected  
        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }
        
        // Add ordering
        query = query.order('order_number', { ascending: true });
        
        const { data, error } = await query;
          
        if (error) throw error;
        
        if (data) {
          setFaqs(data as FAQItem[]);
        }
        
        // Get unique categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('faq')
          .select('category')
          .not('category', 'is', null);
          
        if (!categoryError && categoryData) {
          const uniqueCategories = [...new Set(categoryData.map(item => item.category).filter(Boolean))];
          setCategories(uniqueCategories as string[]);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFAQs();
  }, [selectedCategory]);

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      
      {categories.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          <button 
            className={`px-3 py-1 rounded-full text-sm ${!selectedCategory ? 'bg-primary text-white' : 'bg-secondary'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category ? 'bg-primary text-white' : 'bg-secondary'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border rounded p-4 space-y-2">
              <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 animate-pulse rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.id} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      
      {!loading && faqs.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No FAQs found. Please check back later.</p>
        </div>
      )}
    </div>
  );
}
