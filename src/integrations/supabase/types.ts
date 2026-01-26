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
      feedback: {
        Row: {
          comments: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          fitting_rating: number
          id: string
          order_id: string | null
          overall_experience: number
          quality_rating: number
        }
        Insert: {
          comments?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          fitting_rating: number
          id?: string
          order_id?: string | null
          overall_experience: number
          quality_rating: number
        }
        Update: {
          comments?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          fitting_rating?: number
          id?: string
          order_id?: string | null
          overall_experience?: number
          quality_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          arm_hole: string | null
          arm_round: string | null
          back_neck_depth: string | null
          blouse_back_length: string | null
          blouse_type: string | null
          chest: string | null
          city: string | null
          country: string | null
          created_at: string
          delivery_date: string | null
          design_description: string | null
          email: string
          extra_cloths_laces: string | null
          front_length: string | null
          front_neck_depth: string | null
          full_name: string
          full_shoulder: string | null
          hook_position: string | null
          id: string
          order_date: string
          phone: string
          selected_design: string | null
          shoulder_strap: string | null
          shoulder_to_apex: string | null
          sleeve_length: string | null
          sleeve_round: string | null
          special_requests: string | null
          state: string | null
          status: string
          street: string | null
          updated_at: string
          waist: string | null
          want_measurement_help: boolean | null
          zip: string | null
        }
        Insert: {
          arm_hole?: string | null
          arm_round?: string | null
          back_neck_depth?: string | null
          blouse_back_length?: string | null
          blouse_type?: string | null
          chest?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          delivery_date?: string | null
          design_description?: string | null
          email: string
          extra_cloths_laces?: string | null
          front_length?: string | null
          front_neck_depth?: string | null
          full_name: string
          full_shoulder?: string | null
          hook_position?: string | null
          id?: string
          order_date?: string
          phone: string
          selected_design?: string | null
          shoulder_strap?: string | null
          shoulder_to_apex?: string | null
          sleeve_length?: string | null
          sleeve_round?: string | null
          special_requests?: string | null
          state?: string | null
          status?: string
          street?: string | null
          updated_at?: string
          waist?: string | null
          want_measurement_help?: boolean | null
          zip?: string | null
        }
        Update: {
          arm_hole?: string | null
          arm_round?: string | null
          back_neck_depth?: string | null
          blouse_back_length?: string | null
          blouse_type?: string | null
          chest?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          delivery_date?: string | null
          design_description?: string | null
          email?: string
          extra_cloths_laces?: string | null
          front_length?: string | null
          front_neck_depth?: string | null
          full_name?: string
          full_shoulder?: string | null
          hook_position?: string | null
          id?: string
          order_date?: string
          phone?: string
          selected_design?: string | null
          shoulder_strap?: string | null
          shoulder_to_apex?: string | null
          sleeve_length?: string | null
          sleeve_round?: string | null
          special_requests?: string | null
          state?: string | null
          status?: string
          street?: string | null
          updated_at?: string
          waist?: string | null
          want_measurement_help?: boolean | null
          zip?: string | null
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
