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
      detected_changes: {
        Row: {
          acknowledged_at: string | null
          change_type: string
          current_price: number | null
          details: Json
          detected_at: string
          id: string
          meaningfulness_score: number | null
          pct_change: number | null
          reference_price: number | null
          snapshot_id: string | null
          symbol: string
          user_id: string
          watchlist_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          change_type: string
          current_price?: number | null
          details?: Json
          detected_at?: string
          id?: string
          meaningfulness_score?: number | null
          pct_change?: number | null
          reference_price?: number | null
          snapshot_id?: string | null
          symbol: string
          user_id: string
          watchlist_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          change_type?: string
          current_price?: number | null
          details?: Json
          detected_at?: string
          id?: string
          meaningfulness_score?: number | null
          pct_change?: number | null
          reference_price?: number | null
          snapshot_id?: string | null
          symbol?: string
          user_id?: string
          watchlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detected_changes_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "user_market_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detected_changes_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      instruments: {
        Row: {
          asset_type: string
          created_at: string
          exchange: string | null
          name: string
          symbol: string
        }
        Insert: {
          asset_type?: string
          created_at?: string
          exchange?: string | null
          name: string
          symbol: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          exchange?: string | null
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      market_events: {
        Row: {
          body: string | null
          created_at: string
          event_timestamp: string
          event_type: string
          headline: string
          id: string
          source: string | null
          symbol: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          event_timestamp: string
          event_type: string
          headline: string
          id?: string
          source?: string | null
          symbol?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          event_timestamp?: string
          event_type?: string
          headline?: string
          id?: string
          source?: string | null
          symbol?: string | null
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          created_at: string
          id: number
          market_timestamp: string
          previous_close: number | null
          price: number
          source: string | null
          symbol: string
          volume: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          market_timestamp: string
          previous_close?: number | null
          price: number
          source?: string | null
          symbol: string
          volume?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          market_timestamp?: string
          previous_close?: number | null
          price?: number
          source?: string | null
          symbol?: string
          volume?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      snapshot_stock_states: {
        Row: {
          created_at: string
          id: string
          market_timestamp: string
          price: number
          snapshot_id: string
          symbol: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_timestamp: string
          price: number
          snapshot_id: string
          symbol: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          market_timestamp?: string
          price?: number
          snapshot_id?: string
          symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "snapshot_stock_states_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "user_market_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          comment: string | null
          created_at: string
          detected_change_id: string | null
          id: string
          rating: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          detected_change_id?: string | null
          id?: string
          rating: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          detected_change_id?: string | null
          id?: string
          rating?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_detected_change_id_fkey"
            columns: ["detected_change_id"]
            isOneToOne: false
            referencedRelation: "detected_changes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_market_snapshots: {
        Row: {
          created_at: string
          id: string
          user_id: string
          viewed_at: string
          watchlist_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          viewed_at?: string
          watchlist_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          viewed_at?: string
          watchlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_market_snapshots_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist_stocks: {
        Row: {
          added_at: string
          id: string
          symbol: string
          user_id: string
          watchlist_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          symbol: string
          user_id: string
          watchlist_id: string
        }
        Update: {
          added_at?: string
          id?: string
          symbol?: string
          user_id?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_stocks_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
