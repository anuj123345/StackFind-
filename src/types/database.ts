export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PricingModel = 'free' | 'freemium' | 'paid' | 'open_source'
export type ToolStatus = 'pending' | 'approved' | 'rejected'

export type Database = {
  public: {
    Tables: {
      tools: {
        Row: {
          id: string
          slug: string
          name: string
          tagline: string
          description: string | null
          website: string | null
          logo_url: string | null
          screenshots: Json
          pricing_model: PricingModel
          starting_price_usd: number | null
          starting_price_inr: number | null
          has_inr_billing: boolean
          has_gst_invoice: boolean
          has_upi: boolean
          has_india_support: boolean
          is_made_in_india: boolean
          status: ToolStatus
          featured_until: string | null
          upvotes: number
          views: number
          pricing_modelling: Json
          submitted_by: string | null
          managed_billing_enabled: boolean
          inr_purchase_link: string | null
          convenience_fee_percent: number
          created_at: string
          approved_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          name: string
          tagline: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          screenshots?: Json
          pricing_model: PricingModel
          starting_price_usd?: number | null
          starting_price_inr?: number | null
          has_inr_billing?: boolean
          has_gst_invoice?: boolean
          has_upi?: boolean
          has_india_support?: boolean
          is_made_in_india?: boolean
          status?: ToolStatus
          featured_until?: string | null
          upvotes?: number
          views?: number
          pricing_modelling?: Json
          submitted_by?: string | null
          managed_billing_enabled?: boolean
          inr_purchase_link?: string | null
          convenience_fee_percent?: number
          created_at?: string
          approved_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          tagline?: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          screenshots?: Json
          pricing_model?: PricingModel
          starting_price_usd?: number | null
          starting_price_inr?: number | null
          has_inr_billing?: boolean
          has_gst_invoice?: boolean
          has_upi?: boolean
          has_india_support?: boolean
          is_made_in_india?: boolean
          status?: ToolStatus
          featured_until?: string | null
          upvotes?: number
          views?: number
          pricing_modelling?: Json
          submitted_by?: string | null
          managed_billing_enabled?: boolean
          inr_purchase_link?: string | null
          convenience_fee_percent?: number
          created_at?: string
          approved_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          tool_count: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          tool_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          icon?: string | null
          tool_count?: number
          created_at?: string
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          tool_id: string
          category_id: string
        }
        Insert: {
          tool_id: string
          category_id: string
        }
        Update: {
          tool_id?: string
          category_id?: string
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
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          playground_usage_count: number
          is_premium_playground: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          playground_usage_count?: number
          is_premium_playground?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          playground_usage_count?: number
          is_premium_playground?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      submissions: {
        Row: {
          id: string
          email: string
          tool_data: Json
          status: ToolStatus
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          tool_data: Json
          status?: ToolStatus
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          tool_data?: Json
          status?: ToolStatus
          created_at?: string
        }
        Relationships: []
      }
      billing_requests: {
        Row: {
          id: string
          user_id: string
          tool_id: string
          email: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_id: string
          email: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_id?: string
          email?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          active: boolean
          unsubscribe_token: string
          created_at: string
        }
        Insert: {
          email: string
          active?: boolean
          unsubscribe_token?: string
          created_at?: string
        }
        Update: {
          email?: string
          active?: boolean
          unsubscribe_token?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tool = Database['public']['Tables']['tools']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type BillingRequest = Database['public']['Tables']['billing_requests']['Row']
export type ToolCategory = Database['public']['Tables']['tool_categories']['Row']
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']
