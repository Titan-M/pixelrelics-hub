
export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  social_links?: Record<string, any> | null;
  preferences?: Record<string, any> | null;
  member_since?: string | null;
}

export interface UserActivity {
  id: string;
  user_id: string;
  game_id: string;
  activity_type: string;
  created_at: string;
  details?: Record<string, any> | null;
  games?: {
    id: string;
    title: string;
    image_url: string;
  };
}

export interface UserLibraryItem {
  id: string;
  user_id: string;
  game_id: string;
  purchase_date: string;
  is_installed: boolean;
  last_played: string | null;
  games: {
    id: string;
    title: string;
    image_url: string;
    price: number;
    genre: string;
    rating: number;
    description: string;
    is_free: boolean;
  };
}
