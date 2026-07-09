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
      access_logs: {
        Row: {
          created_at: string
          direction: string
          id: string
          method: Database["public"]["Enums"]["access_method"]
          notes: string | null
          person_id: string | null
          result: Database["public"]["Enums"]["access_result"]
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          direction?: string
          id?: string
          method?: Database["public"]["Enums"]["access_method"]
          notes?: string | null
          person_id?: string | null
          result?: Database["public"]["Enums"]["access_result"]
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          method?: Database["public"]["Enums"]["access_method"]
          notes?: string | null
          person_id?: string | null
          result?: Database["public"]["Enums"]["access_result"]
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      blacklist: {
        Row: {
          created_at: string
          created_by: string | null
          document: string
          id: string
          name: string
          reason: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document: string
          id?: string
          name: string
          reason: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document?: string
          id?: string
          name?: string
          reason?: string
        }
        Relationships: []
      }
      persons: {
        Row: {
          created_at: string
          document: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          status: Database["public"]["Enums"]["person_status"]
          type: Database["public"]["Enums"]["person_type"]
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["person_status"]
          type?: Database["public"]["Enums"]["person_type"]
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["person_status"]
          type?: Database["public"]["Enums"]["person_type"]
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          days: string[]
          end_time: string
          id: string
          is_active: boolean
          name: string
          person_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          days?: string[]
          end_time: string
          id?: string
          is_active?: boolean
          name: string
          person_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          days?: string[]
          end_time?: string
          id?: string
          is_active?: boolean
          name?: string
          person_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      visits: {
        Row: {
          created_at: string
          created_by: string | null
          entry_time: string
          exit_time: string | null
          host_id: string | null
          host_name: string | null
          id: string
          reason: string | null
          status: string
          vehicle_plate: string | null
          visitor_document: string
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entry_time?: string
          exit_time?: string | null
          host_id?: string | null
          host_name?: string | null
          id?: string
          reason?: string | null
          status?: string
          vehicle_plate?: string | null
          visitor_document: string
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entry_time?: string
          exit_time?: string | null
          host_id?: string | null
          host_name?: string | null
          id?: string
          reason?: string | null
          status?: string
          vehicle_plate?: string | null
          visitor_document?: string
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      access_method: "facial" | "qr" | "manual" | "card"
      access_result: "authorized" | "denied" | "pending"
      app_role: "admin" | "operator" | "supervisor"
      person_status: "active" | "inactive" | "suspended"
      person_type: "resident" | "employee" | "contractor"
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
      access_method: ["facial", "qr", "manual", "card"],
      access_result: ["authorized", "denied", "pending"],
      app_role: ["admin", "operator", "supervisor"],
      person_status: ["active", "inactive", "suspended"],
      person_type: ["resident", "employee", "contractor"],
    },
  },
} as const
