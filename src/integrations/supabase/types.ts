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
      app_settings: {
        Row: {
          chatbot_base_url: string | null
          chatbot_token: string | null
          chatbot_webhook: string | null
          id: string
          support_telegram: string | null
          support_whatsapp: string | null
          theme: Json
          updated_at: string
        }
        Insert: {
          chatbot_base_url?: string | null
          chatbot_token?: string | null
          chatbot_webhook?: string | null
          id?: string
          support_telegram?: string | null
          support_whatsapp?: string | null
          theme?: Json
          updated_at?: string
        }
        Update: {
          chatbot_base_url?: string | null
          chatbot_token?: string | null
          chatbot_webhook?: string | null
          id?: string
          support_telegram?: string | null
          support_whatsapp?: string | null
          theme?: Json
          updated_at?: string
        }
        Relationships: []
      }
      automation_flows: {
        Row: {
          category: string
          content: Json
          created_at: string
          id: string
          is_template: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: Json
          created_at?: string
          id?: string
          is_template?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string
          id?: string
          is_template?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact: string | null
          created_at: string
          due_date: string | null
          id: string
          name: string
          notes: string | null
          plan_id: string | null
          plan_type: string
          reseller_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          notes?: string | null
          plan_id?: string | null
          plan_type?: string
          reseller_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          plan_id?: string | null
          plan_type?: string
          reseller_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          credits: number | null
          id: string
          invested_at: string
          notes: string | null
          panel_name: string | null
          reseller_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          credits?: number | null
          id?: string
          invested_at?: string
          notes?: string | null
          panel_name?: string | null
          reseller_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          credits?: number | null
          id?: string
          invested_at?: string
          notes?: string | null
          panel_name?: string | null
          reseller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      iptv_access: {
        Row: {
          client_name: string | null
          created_at: string
          id: string
          password: string
          server_primary: string | null
          server_secondary: string | null
          support_telegram: string | null
          support_whatsapp: string | null
          token: string
          updated_at: string
          username: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          id?: string
          password: string
          server_primary?: string | null
          server_secondary?: string | null
          support_telegram?: string | null
          support_whatsapp?: string | null
          token?: string
          updated_at?: string
          username: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          id?: string
          password?: string
          server_primary?: string | null
          server_secondary?: string | null
          support_telegram?: string | null
          support_whatsapp?: string | null
          token?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          method: string
          paid_at: string
          plan_id: string | null
          reference: string | null
          reseller_id: string | null
          status: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          method?: string
          paid_at?: string
          plan_id?: string | null
          reference?: string | null
          reseller_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          method?: string
          paid_at?: string
          plan_id?: string | null
          reference?: string | null
          reseller_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          accent_color: string
          active: boolean
          badge: string | null
          created_at: string
          description: string | null
          duration_days: number
          highlighted: boolean
          id: string
          name: string
          period: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          accent_color?: string
          active?: boolean
          badge?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          highlighted?: boolean
          id?: string
          name: string
          period?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          accent_color?: string
          active?: boolean
          badge?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          highlighted?: boolean
          id?: string
          name?: string
          period?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      reseller_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string
          description: string | null
          id: string
          reference: string | null
          reseller_id: string
          status: string
          type: string
        }
        Insert: {
          amount?: number
          balance_after?: number | null
          created_at?: string
          description?: string | null
          id?: string
          reference?: string | null
          reseller_id: string
          status?: string
          type?: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string
          description?: string | null
          id?: string
          reference?: string | null
          reseller_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_transactions_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      resellers: {
        Row: {
          balance: number
          contact: string | null
          created_at: string
          credit_cost: number
          email: string | null
          id: string
          name: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          balance?: number
          contact?: string | null
          created_at?: string
          credit_cost?: number
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          balance?: number
          contact?: string | null
          created_at?: string
          credit_cost?: number
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
