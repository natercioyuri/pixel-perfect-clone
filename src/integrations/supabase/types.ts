export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          product_id: string | null
          title: string
          trending_score: number | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          product_id?: string | null
          title: string
          trending_score?: number | null
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          product_id?: string | null
          title?: string
          trending_score?: number | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "viral_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ranking_history: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          rank_position: number
          snapshot_date: string
          trending_score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          rank_position: number
          snapshot_date?: string
          trending_score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          rank_position?: number
          snapshot_date?: string
          trending_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_ranking_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "viral_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "viral_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_items_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "viral_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      viral_products: {
        Row: {
          category: string | null
          country: string | null
          created_at: string
          id: string
          price: number | null
          product_image: string | null
          product_name: string
          revenue: number | null
          sales_count: number | null
          shop_name: string | null
          shop_url: string | null
          source: string | null
          tiktok_url: string | null
          trending_score: number | null
          updated_at: string
          video_likes: number | null
          video_shares: number | null
          video_views: number | null
        }
        Insert: {
          category?: string | null
          country?: string | null
          created_at?: string
          id?: string
          price?: number | null
          product_image?: string | null
          product_name: string
          revenue?: number | null
          sales_count?: number | null
          shop_name?: string | null
          shop_url?: string | null
          source?: string | null
          tiktok_url?: string | null
          trending_score?: number | null
          updated_at?: string
          video_likes?: number | null
          video_shares?: number | null
          video_views?: number | null
        }
        Update: {
          category?: string | null
          country?: string | null
          created_at?: string
          id?: string
          price?: number | null
          product_image?: string | null
          product_name?: string
          revenue?: number | null
          sales_count?: number | null
          shop_name?: string | null
          shop_url?: string | null
          source?: string | null
          tiktok_url?: string | null
          trending_score?: number | null
          updated_at?: string
          video_likes?: number | null
          video_shares?: number | null
          video_views?: number | null
        }
        Relationships: []
      }
      viral_videos: {
        Row: {
          comments: number | null
          created_at: string
          creator_name: string | null
          duration_seconds: number | null
          engagement_rate: number | null
          hashtags: string[] | null
          id: string
          likes: number | null
          product_name: string | null
          revenue_estimate: number | null
          shares: number | null
          source: string | null
          thumbnail_url: string | null
          title: string | null
          transcription: string | null
          trending_score: number | null
          updated_at: string
          video_url: string | null
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          creator_name?: string | null
          duration_seconds?: number | null
          engagement_rate?: number | null
          hashtags?: string[] | null
          id?: string
          likes?: number | null
          product_name?: string | null
          revenue_estimate?: number | null
          shares?: number | null
          source?: string | null
          thumbnail_url?: string | null
          title?: string | null
          transcription?: string | null
          trending_score?: number | null
          updated_at?: string
          video_url?: string | null
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          creator_name?: string | null
          duration_seconds?: number | null
          engagement_rate?: number | null
          hashtags?: string[] | null
          id?: string
          likes?: number | null
          product_name?: string | null
          revenue_estimate?: number | null
          shares?: number | null
          source?: string | null
          thumbnail_url?: string | null
          title?: string | null
          transcription?: string | null
          trending_score?: number | null
          updated_at?: string
          video_url?: string | null
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
