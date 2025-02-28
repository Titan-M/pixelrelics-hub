
import { Json } from "@/integrations/supabase/types";

export interface GameDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
  image_url: string;
  genre: string;
  rating: number;
  developer?: string;
  publisher?: string;
  release_date?: string;
  platform?: string[];
  tags?: string[];
  system_requirements?: {
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
  };
  media_gallery?: {
    screenshots?: string[];
    videos?: string[];
  };
  features?: string[];
}

// Helper functions to safely parse JSON
export function parseJsonToSystemRequirements(json: Json | null): GameDetail['system_requirements'] | undefined {
  if (!json) return undefined;
  
  try {
    if (typeof json === 'string') {
      return JSON.parse(json);
    }
    return json as GameDetail['system_requirements'];
  } catch (e) {
    console.error('Error parsing system_requirements:', e);
    return undefined;
  }
}

export function parseJsonToMediaGallery(json: Json | null): GameDetail['media_gallery'] | undefined {
  if (!json) return undefined;
  
  try {
    if (typeof json === 'string') {
      return JSON.parse(json);
    }
    return json as GameDetail['media_gallery'];
  } catch (e) {
    console.error('Error parsing media_gallery:', e);
    return undefined;
  }
}
