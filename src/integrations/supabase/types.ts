export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cart: {
        Row: {
          added_at: string
          game_id: string
          id: string
          quantity: number
          user_id: string
        }
        Insert: {
          added_at?: string
          game_id: string
          id?: string
          quantity?: number
          user_id: string
        }
        Update: {
          added_at?: string
          game_id?: string
          id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      community: {
        Row: {
          created_at: string
          faq_id: string | null
          game_id: string | null
          id: number
          moderator_id: string | null
          news_id: string | null
        }
        Insert: {
          created_at?: string
          faq_id?: string | null
          game_id?: string | null
          id?: number
          moderator_id?: string | null
          news_id?: string | null
        }
        Update: {
          created_at?: string
          faq_id?: string | null
          game_id?: string | null
          id?: number
          moderator_id?: string | null
          news_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faq"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      creditcard_payments: {
        Row: {
          created_at: string
          id: number
          payment_id: number
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          payment_id: number
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          payment_id?: number
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creditcard_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creditcard_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creditcard_payments_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["username"]
          },
        ]
      }
      debitcard_payments: {
        Row: {
          created_at: string
          id: number
          payment_id: number
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          payment_id: number
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          payment_id?: number
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debitcard_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debitcard_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debitcard_payments_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["username"]
          },
        ]
      }
      faq: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          order_number: number | null
          question: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          order_number?: number | null
          question: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          order_number?: number | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      free_games: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      game_details: {
        Row: {
          developer: string | null
          features: string[] | null
          id: string
          media_gallery: Json | null
          platform: string[] | null
          publisher: string | null
          release_date: string | null
          system_requirements: Json | null
          tags: string[] | null
        }
        Insert: {
          developer?: string | null
          features?: string[] | null
          id: string
          media_gallery?: Json | null
          platform?: string[] | null
          publisher?: string | null
          release_date?: string | null
          system_requirements?: Json | null
          tags?: string[] | null
        }
        Update: {
          developer?: string | null
          features?: string[] | null
          id?: string
          media_gallery?: Json | null
          platform?: string[] | null
          publisher?: string | null
          release_date?: string | null
          system_requirements?: Json | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "game_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          genre: string | null
          id: string
          image_url: string | null
          is_free: boolean | null
          price: number | null
          rating: number | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          price?: number | null
          rating?: number | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          price?: number | null
          rating?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          game_id: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_at: string
          title: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          game_id?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string
          title: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          game_id?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      paid_games: {
        Row: {
          created_at: string
          discount_percentage: number | null
          id: number
        }
        Insert: {
          created_at?: string
          discount_percentage?: number | null
          id?: number
        }
        Update: {
          created_at?: string
          discount_percentage?: number | null
          id?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          created_at: string
          game_id: string | null
          id: number
          payment_type: string
          status: string
          username: string
        }
        Insert: {
          created_at?: string
          game_id?: string | null
          id?: number
          payment_type: string
          status?: string
          username: string
        }
        Update: {
          created_at?: string
          game_id?: string | null
          id?: number
          payment_type?: string
          status?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["username"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          location: string | null
          member_since: string | null
          preferences: Json | null
          social_links: Json | null
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          location?: string | null
          member_since?: string | null
          preferences?: Json | null
          social_links?: Json | null
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          location?: string | null
          member_since?: string | null
          preferences?: Json | null
          social_links?: Json | null
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      upi_payments: {
        Row: {
          created_at: string
          id: number
          payment_id: number
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: number
          payment_id: number
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: number
          payment_id?: number
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "upi_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upi_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upi_payments_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["username"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          details: Json | null
          game_id: string
          id: string
          library_entry_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          details?: Json | null
          game_id: string
          id?: string
          library_entry_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          details?: Json | null
          game_id?: string
          id?: string
          library_entry_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_library_entry_id_fkey"
            columns: ["library_entry_id"]
            isOneToOne: false
            referencedRelation: "user_library"
            referencedColumns: ["id"]
          },
        ]
      }
      user_library: {
        Row: {
          game_id: string
          id: string
          is_installed: boolean | null
          last_played: string | null
          payment_id: number | null
          playtime_minutes: number | null
          purchase_date: string
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          is_installed?: boolean | null
          last_played?: string | null
          payment_id?: number | null
          playtime_minutes?: number | null
          purchase_date?: string
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          is_installed?: boolean | null
          last_played?: string | null
          payment_id?: number | null
          playtime_minutes?: number | null
          purchase_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_library_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_library_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          added_at: string
          game_id: string
          id: string
          priority: number | null
          user_id: string
        }
        Insert: {
          added_at?: string
          game_id: string
          id?: string
          priority?: number | null
          user_id: string
        }
        Update: {
          added_at?: string
          game_id?: string
          id?: string
          priority?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_game_details: {
        Args: {
          game_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
