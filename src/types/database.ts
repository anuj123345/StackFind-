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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      billing_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          notes: string | null
          status: string | null
          tool_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          notes?: string | null
          status?: string | null
          tool_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          notes?: string | null
          status?: string | null
          tool_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_requests_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          tool_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          tool_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          tool_count?: number
        }
        Relationships: []
      }
      founders: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          id: string
          is_verified: boolean
          linkedin: string | null
          name: string
          slug: string
          twitter: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          linkedin?: string | null
          name: string
          slug: string
          twitter?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          linkedin?: string | null
          name?: string
          slug?: string
          twitter?: string | null
        }
        Relationships: []
      }
      newsletter_subs: {
        Row: {
          confirmed: boolean
          created_at: string
          email: string
          id: string
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          active: boolean
          email: string
          id: string
          last_sent_at: string | null
          subscribed_at: string
          unsubscribe_token: string
        }
        Insert: {
          active?: boolean
          email: string
          id?: string
          last_sent_at?: string | null
          subscribed_at?: string
          unsubscribe_token?: string
        }
        Update: {
          active?: boolean
          email?: string
          id?: string
          last_sent_at?: string | null
          subscribed_at?: string
          unsubscribe_token?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_premium_playground: boolean
          playground_usage_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_premium_playground?: boolean
          playground_usage_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_premium_playground?: boolean
          playground_usage_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      stack_feedback: {
        Row: {
          created_at: string
          id: string
          project_description: string | null
          recommended_tools: string[] | null
          signal: string
          stack_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_description?: string | null
          recommended_tools?: string[] | null
          signal: string
          stack_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_description?: string | null
          recommended_tools?: string[] | null
          signal?: string
          stack_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stack_feedback_stack_id_fkey"
            columns: ["stack_id"]
            isOneToOne: false
            referencedRelation: "user_stacks"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          payment_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          plan: Database["public"]["Enums"]["submission_plan"]
          status: Database["public"]["Enums"]["tool_status"]
          tool_data: Json
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          plan?: Database["public"]["Enums"]["submission_plan"]
          status?: Database["public"]["Enums"]["tool_status"]
          tool_data?: Json
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          plan?: Database["public"]["Enums"]["submission_plan"]
          status?: Database["public"]["Enums"]["tool_status"]
          tool_data?: Json
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          category_id: string
          tool_id: string
        }
        Insert: {
          category_id: string
          tool_id: string
        }
        Update: {
          category_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_categories_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_recommendation_stats: {
        Row: {
          negative_signals: number
          positive_signals: number
          recommended_count: number
          tool_slug: string
          updated_at: string
        }
        Insert: {
          negative_signals?: number
          positive_signals?: number
          recommended_count?: number
          tool_slug: string
          updated_at?: string
        }
        Update: {
          negative_signals?: number
          positive_signals?: number
          recommended_count?: number
          tool_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          approved_at: string | null
          convenience_fee_percent: number | null
          created_at: string
          description: string | null
          featured_until: string | null
          has_gst_invoice: boolean
          has_india_support: boolean
          has_inr_billing: boolean
          has_upi: boolean
          id: string
          inr_purchase_link: string | null
          is_made_in_india: boolean
          logo_url: string | null
          managed_billing_enabled: boolean | null
          name: string
          pricing_model: Database["public"]["Enums"]["pricing_model"]
          screenshots: Json | null
          slug: string
          starting_price_inr: number | null
          starting_price_usd: number | null
          status: Database["public"]["Enums"]["tool_status"]
          submitted_by: string | null
          tagline: string
          upvotes: number
          views: number
          website: string | null
        }
        Insert: {
          approved_at?: string | null
          convenience_fee_percent?: number | null
          created_at?: string
          description?: string | null
          featured_until?: string | null
          has_gst_invoice?: boolean
          has_india_support?: boolean
          has_inr_billing?: boolean
          has_upi?: boolean
          id?: string
          inr_purchase_link?: string | null
          is_made_in_india?: boolean
          logo_url?: string | null
          managed_billing_enabled?: boolean | null
          name: string
          pricing_model?: Database["public"]["Enums"]["pricing_model"]
          screenshots?: Json | null
          slug: string
          starting_price_inr?: number | null
          starting_price_usd?: number | null
          status?: Database["public"]["Enums"]["tool_status"]
          submitted_by?: string | null
          tagline: string
          upvotes?: number
          views?: number
          website?: string | null
        }
        Update: {
          approved_at?: string | null
          convenience_fee_percent?: number | null
          created_at?: string
          description?: string | null
          featured_until?: string | null
          has_gst_invoice?: boolean
          has_india_support?: boolean
          has_inr_billing?: boolean
          has_upi?: boolean
          id?: string
          inr_purchase_link?: string | null
          is_made_in_india?: boolean
          logo_url?: string | null
          managed_billing_enabled?: boolean | null
          name?: string
          pricing_model?: Database["public"]["Enums"]["pricing_model"]
          screenshots?: Json | null
          slug?: string
          starting_price_inr?: number | null
          starting_price_usd?: number | null
          status?: Database["public"]["Enums"]["tool_status"]
          submitted_by?: string | null
          tagline?: string
          upvotes?: number
          views?: number
          website?: string | null
        }
        Relationships: []
      }
      upvotes: {
        Row: {
          created_at: string
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upvotes_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stacks: {
        Row: {
          ai_reasoning: string | null
          created_at: string
          id: string
          is_archived: boolean
          is_saved: boolean
          project_description: string
          source: string
          tool_slugs: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_reasoning?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          is_saved?: boolean
          project_description: string
          source?: string
          tool_slugs?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_reasoning?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          is_saved?: boolean
          project_description?: string
          source?: string
          tool_slugs?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_tool_views: { Args: { tool_slug: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      payment_status: "pending" | "paid" | "failed" | "refunded"
      pricing_model: "free" | "freemium" | "paid" | "open_source"
      submission_plan: "free" | "fast_track" | "featured"
      tool_status: "pending" | "approved" | "rejected"
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
    Enums: {
      payment_status: ["pending", "paid", "failed", "refunded"],
      pricing_model: ["free", "freemium", "paid", "open_source"],
      submission_plan: ["free", "fast_track", "featured"],
      tool_status: ["pending", "approved", "rejected"],
    },
  },
} as const
