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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          badge: string | null
          best_for: string | null
          created_at: string
          department: string
          description: string | null
          direct_phone: string | null
          fit_statement: string | null
          id: string
          is_active: boolean
          is_primary_booking: boolean
          known_for: string[]
          name: string
          role: string
          service_categories: string[]
          service_category: string | null
          specialties: string[]
          specialty: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          best_for?: string | null
          created_at?: string
          department: string
          description?: string | null
          direct_phone?: string | null
          fit_statement?: string | null
          id: string
          is_active?: boolean
          is_primary_booking?: boolean
          known_for?: string[]
          name: string
          role: string
          service_categories?: string[]
          service_category?: string | null
          specialties?: string[]
          specialty: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          best_for?: string | null
          created_at?: string
          department?: string
          description?: string | null
          direct_phone?: string | null
          fit_statement?: string | null
          id?: string
          is_active?: boolean
          is_primary_booking?: boolean
          known_for?: string[]
          name?: string
          role?: string
          service_categories?: string[]
          service_category?: string | null
          specialties?: string[]
          specialty?: string
          updated_at?: string
        }
        Relationships: []
      }
      callback_requests: {
        Row: {
          concierge_context: Json | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          interested_in: string | null
          message: string | null
          phone: string
          source: string | null
          status: string | null
          timing: string | null
        }
        Insert: {
          concierge_context?: Json | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          interested_in?: string | null
          message?: string | null
          phone: string
          source?: string | null
          status?: string | null
          timing?: string | null
        }
        Update: {
          concierge_context?: Json | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          interested_in?: string | null
          message?: string | null
          phone?: string
          source?: string | null
          status?: string | null
          timing?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          channel: string
          concierge_context: Json | null
          el_cost_credits: number | null
          el_duration_secs: number | null
          elevenlabs_session_id: string | null
          ended_at: string | null
          first_message: string | null
          guest_profile_id: string | null
          id: string
          intent_signals: Json | null
          last_summarized_at: string | null
          last_summarized_message_count: number
          outcome: string | null
          started_at: string
          status: string
          summary: string | null
        }
        Insert: {
          channel?: string
          concierge_context?: Json | null
          el_cost_credits?: number | null
          el_duration_secs?: number | null
          elevenlabs_session_id?: string | null
          ended_at?: string | null
          first_message?: string | null
          guest_profile_id?: string | null
          id?: string
          intent_signals?: Json | null
          last_summarized_at?: string | null
          last_summarized_message_count?: number
          outcome?: string | null
          started_at?: string
          status?: string
          summary?: string | null
        }
        Update: {
          channel?: string
          concierge_context?: Json | null
          el_cost_credits?: number | null
          el_duration_secs?: number | null
          elevenlabs_session_id?: string | null
          ended_at?: string | null
          first_message?: string | null
          guest_profile_id?: string | null
          id?: string
          intent_signals?: Json | null
          last_summarized_at?: string | null
          last_summarized_message_count?: number
          outcome?: string | null
          started_at?: string
          status?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_guest_profile_id_fkey"
            columns: ["guest_profile_id"]
            isOneToOne: false
            referencedRelation: "guest_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_profiles: {
        Row: {
          created_at: string
          email: string | null
          fingerprint: string | null
          first_name: string | null
          id: string
          intent_score: number | null
          is_returning: boolean
          last_context: Json | null
          last_seen_at: string | null
          notes: string | null
          phone: string | null
          preferred_artist_ids: string[] | null
          preferred_categories: string[] | null
          source: string | null
          updated_at: string
          visit_count: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          fingerprint?: string | null
          first_name?: string | null
          id?: string
          intent_score?: number | null
          is_returning?: boolean
          last_context?: Json | null
          last_seen_at?: string | null
          notes?: string | null
          phone?: string | null
          preferred_artist_ids?: string[] | null
          preferred_categories?: string[] | null
          source?: string | null
          updated_at?: string
          visit_count?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          fingerprint?: string | null
          first_name?: string | null
          id?: string
          intent_score?: number | null
          is_returning?: boolean
          last_context?: Json | null
          last_seen_at?: string | null
          notes?: string | null
          phone?: string | null
          preferred_artist_ids?: string[] | null
          preferred_categories?: string[] | null
          source?: string | null
          updated_at?: string
          visit_count?: number
        }
        Relationships: []
      }
      knowledge_items: {
        Row: {
          category: string
          content: string
          created_at: string
          elevenlabs_doc_id: string | null
          id: string
          is_active: boolean
          last_synced_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          elevenlabs_doc_id?: string | null
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          elevenlabs_doc_id?: string | null
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          category: string | null
          created_at: string | null
          email: string | null
          goal: string | null
          id: string
          name: string | null
          phone: string | null
          timing: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          email?: string | null
          goal?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          timing?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          email?: string | null
          goal?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          timing?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          latency_ms: number | null
          role: string
          source: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          role: string
          source?: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          role?: string
          source?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          category_title: string
          created_at: string
          cross_categories: string[]
          group_name: string
          id: string
          is_active: boolean
          name: string
          price: string
          shared_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          category_title: string
          created_at?: string
          cross_categories?: string[]
          group_name: string
          id?: string
          is_active?: boolean
          name: string
          price: string
          shared_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          category_title?: string
          created_at?: string
          cross_categories?: string[]
          group_name?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: string
          shared_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
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
