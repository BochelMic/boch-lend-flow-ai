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
      credit_requests: {
        Row: {
          id: string
          user_id: string | null
          client_name: string
          client_email: string | null
          client_phone: string | null
          client_address: string | null
          amount: number
          purpose: string | null
          term: number
          status: string
          reviewed_at: string | null
          reviewed_by: string | null
          review_message: string | null
          agent_id: string | null
          created_at: string
          birth_date: string | null
          gender: string | null
          document_type: string | null
          document_number: string | null
          document_issue_date: string | null
          document_expiry_date: string | null
          nuit: string | null
          neighborhood: string | null
          district: string | null
          province: string | null
          residence_type: string | null
          occupation: string | null
          company_name: string | null
          work_duration: string | null
          monthly_income: string | null
          credit_purpose: string | null
          receive_date: string | null
          guarantee_type: string | null
          guarantee_mode: string | null
          observations: string | null
          doc_front_url: string | null
          doc_back_url: string | null
          guarantee_photos: string[] | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          client_name: string
          client_email?: string | null
          client_phone?: string | null
          client_address?: string | null
          amount: number
          purpose?: string | null
          term?: number
          status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          review_message?: string | null
          agent_id?: string | null
          created_at?: string
          birth_date?: string | null
          gender?: string | null
          document_type?: string | null
          document_number?: string | null
          document_issue_date?: string | null
          document_expiry_date?: string | null
          nuit?: string | null
          neighborhood?: string | null
          district?: string | null
          province?: string | null
          residence_type?: string | null
          occupation?: string | null
          company_name?: string | null
          work_duration?: string | null
          monthly_income?: string | null
          credit_purpose?: string | null
          receive_date?: string | null
          guarantee_type?: string | null
          guarantee_mode?: string | null
          observations?: string | null
          doc_front_url?: string | null
          doc_back_url?: string | null
          guarantee_photos?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string | null
          client_name?: string
          client_email?: string | null
          client_phone?: string | null
          client_address?: string | null
          amount?: number
          purpose?: string | null
          term?: number
          status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          review_message?: string | null
          agent_id?: string | null
          created_at?: string
          birth_date?: string | null
          gender?: string | null
          document_type?: string | null
          document_number?: string | null
          document_issue_date?: string | null
          document_expiry_date?: string | null
          nuit?: string | null
          neighborhood?: string | null
          district?: string | null
          province?: string | null
          residence_type?: string | null
          occupation?: string | null
          company_name?: string | null
          work_duration?: string | null
          monthly_income?: string | null
          credit_purpose?: string | null
          receive_date?: string | null
          guarantee_type?: string | null
          guarantee_mode?: string | null
          observations?: string | null
          doc_front_url?: string | null
          doc_back_url?: string | null
          guarantee_photos?: string[] | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          active: boolean | null
          channels: string[] | null
          created_at: string
          event_trigger: string
          id: string
          message_template: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          channels?: string[] | null
          created_at?: string
          event_trigger: string
          id?: string
          message_template: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          channels?: string[] | null
          created_at?: string
          event_trigger?: string
          id?: string
          message_template?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          agent_id: string | null
          created_at: string
          email: string | null
          id: string
          id_number: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          agent_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          id_number?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          agent_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          id_number?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      loans: {
        Row: {
          agent_id: string | null
          amount: number
          client_id: string
          created_at: string
          end_date: string | null
          id: string
          installments: number
          interest_rate: number
          remaining_amount: number
          start_date: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          amount: number
          client_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          installments?: number
          interest_rate?: number
          remaining_amount: number
          start_date?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          amount?: number
          client_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          installments?: number
          interest_rate?: number
          remaining_amount?: number
          start_date?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          from_user_id: string | null
          id: string
          link_url: string | null
          push_delivered: boolean | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          from_user_id?: string | null
          id?: string
          link_url?: string | null
          push_delivered?: boolean | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          from_user_id?: string | null
          id?: string
          link_url?: string | null
          push_delivered?: boolean | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          loan_id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          received_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          loan_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          received_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          received_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_agents_bulk: {
        Args: { agent_user_ids: string[] }
        Returns: Json
      }
      get_user_role: {
        Args: { _user_id: string }
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
      app_role: "gestor" | "agente" | "cliente"
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
      app_role: ["gestor", "agente", "cliente"],
    },
  },
} as const
