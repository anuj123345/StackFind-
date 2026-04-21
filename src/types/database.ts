export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PricingModel = 'free' | 'freemium' | 'paid' | 'open_source'
export type ToolStatus = 'pending' | 'approved' | 'rejected'
export type SubmissionPlan = 'free' | 'fast_track' | 'featured'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Database {
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
        Insert: Omit<Database['public']['Tables']['tools']['Row'], 'id' | 'created_at' | 'upvotes' | 'views'>
        Update: Partial<Database['public']['Tables']['tools']['Insert']>
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
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'tool_count'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      tool_categories: {
        Row: {
          tool_id: string
          category_id: string
        }
        Insert: Database['public']['Tables']['tool_categories']['Row']
        Update: Partial<Database['public']['Tables']['tool_categories']['Row']>
      }
      founders: {
        Row: {
          id: string
          slug: string
          name: string
          bio: string | null
          avatar_url: string | null
          city: string | null
          twitter: string | null
          linkedin: string | null
          is_verified: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['founders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['founders']['Insert']>
      }
      billing_requests: {
        Row: {
          id: string
          user_id: string
          tool_id: string
          email: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          tool_id: string
          email?: string | null
          status?: string
          notes?: string | null
        }
        Update: {
          status?: string
          notes?: string | null
        }
      },
      upvotes: {
        Row: {
          user_id: string
          tool_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['upvotes']['Row'], 'created_at'>
        Update: never
      }
      submissions: {
        Row: {
          id: string
          email: string
          tool_data: Json
          plan: SubmissionPlan
          payment_id: string | null
          payment_status: PaymentStatus
          status: ToolStatus
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['submissions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['submissions']['Insert']>
      }
      newsletter_subs: {
        Row: {
          id: string
          email: string
          confirmed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['newsletter_subs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['newsletter_subs']['Insert']>
      }
    }
    Functions: {
      increment_tool_views: {
        Args: { tool_slug: string }
        Returns: void
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}

// Convenience types
export type Tool = Database['public']['Tables']['tools']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type ToolCategory = Database['public']['Tables']['tool_categories']['Row']
export type Founder = Database['public']['Tables']['founders']['Row']
export type Upvote = Database['public']['Tables']['upvotes']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type NewsletterSub = Database['public']['Tables']['newsletter_subs']['Row']

// Extended types with relations
export type ToolWithCategories = Tool & {
  categories: Category[]
}
