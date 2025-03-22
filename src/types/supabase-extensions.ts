
import { Json } from "@/integrations/supabase/types";

export interface SystemRequirements {
  minimum?: {
    os?: string;
    processor?: string;
    memory?: string;
    graphics?: string;
    storage?: string;
  };
  recommended?: {
    os?: string;
    processor?: string;
    memory?: string;
    graphics?: string;
    storage?: string;
  };
}

export interface MediaGallery {
  screenshots?: string[];
  videos?: string[];
}

export interface GameDetail {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  is_free: boolean | null;
  image_url: string | null;
  genre: string | null;
  rating: number | null;
  created_at: string;
  developer?: string | null;
  publisher?: string | null;
  release_date?: string | null;
  platform?: string[] | null;
  tags?: string[] | null;
  system_requirements?: SystemRequirements;
  media_gallery?: MediaGallery;
  features?: string[] | null;
}

export function parseJsonToSystemRequirements(json: Json | null): SystemRequirements | undefined {
  if (!json) return undefined;
  
  // If it's a string, try to parse it
  if (typeof json === 'string') {
    try {
      return JSON.parse(json) as SystemRequirements;
    } catch (e) {
      console.error('Error parsing system_requirements JSON:', e);
      return undefined;
    }
  }
  
  // If it's already an object, return it directly
  return json as SystemRequirements;
}

export function parseJsonToMediaGallery(json: Json | null): MediaGallery | undefined {
  if (!json) return undefined;
  
  // If it's a string, try to parse it
  if (typeof json === 'string') {
    try {
      return JSON.parse(json) as MediaGallery;
    } catch (e) {
      console.error('Error parsing media_gallery JSON:', e);
      return undefined;
    }
  }
  
  // If it's already an object, return it directly
  return json as MediaGallery;
}

// Function to safely parse any JSON field
export function parseJsonField<T>(json: Json | null, defaultValue: T): T {
  if (!json) return defaultValue;
  
  if (typeof json === 'string') {
    try {
      return JSON.parse(json) as T;
    } catch (e) {
      console.error('Error parsing JSON field:', e);
      return defaultValue;
    }
  }
  
  return json as T;
}
