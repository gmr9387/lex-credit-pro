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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      action_plans: {
        Row: {
          action_type: string
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_impact: number | null
          id: string
          metadata: Json | null
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          action_type: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_impact?: number | null
          id?: string
          metadata?: Json | null
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          action_type?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_impact?: number | null
          id?: string
          metadata?: Json | null
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_name: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bureau_responses: {
        Row: {
          bureau: string
          created_at: string
          dispute_id: string | null
          id: string
          items_affected: Json | null
          next_action: string | null
          notes: string | null
          response_date: string | null
          response_document_url: string | null
          response_type: string
          user_id: string
        }
        Insert: {
          bureau: string
          created_at?: string
          dispute_id?: string | null
          id?: string
          items_affected?: Json | null
          next_action?: string | null
          notes?: string | null
          response_date?: string | null
          response_document_url?: string | null
          response_type: string
          user_id: string
        }
        Update: {
          bureau?: string
          created_at?: string
          dispute_id?: string | null
          id?: string
          items_affected?: Json | null
          next_action?: string | null
          notes?: string | null
          response_date?: string | null
          response_document_url?: string | null
          response_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bureau_responses_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_milestones: {
        Row: {
          achieved: boolean
          achieved_at: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          milestone_type: string
          target_date: string | null
          target_score: number | null
          user_id: string
        }
        Insert: {
          achieved?: boolean
          achieved_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          milestone_type: string
          target_date?: string | null
          target_score?: number | null
          user_id: string
        }
        Update: {
          achieved?: boolean
          achieved_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          milestone_type?: string
          target_date?: string | null
          target_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      credit_reports: {
        Row: {
          analysis_data: Json | null
          bureau: string | null
          current_score: number | null
          file_name: string | null
          file_url: string | null
          id: string
          status: string | null
          updated_at: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          bureau?: string | null
          current_score?: number | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          updated_at?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          bureau?: string | null
          current_score?: number | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          updated_at?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          auto_followup_scheduled: boolean | null
          bureau: string
          cfpb_complaint_date: string | null
          cfpb_complaint_filed: boolean | null
          created_at: string
          evidence_urls: string[] | null
          id: string
          item_id: string | null
          letter_content: string
          outcome: string | null
          response_date: string | null
          response_deadline: string | null
          round_number: number | null
          sent_date: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_followup_scheduled?: boolean | null
          bureau: string
          cfpb_complaint_date?: string | null
          cfpb_complaint_filed?: boolean | null
          created_at?: string
          evidence_urls?: string[] | null
          id?: string
          item_id?: string | null
          letter_content: string
          outcome?: string | null
          response_date?: string | null
          response_deadline?: string | null
          round_number?: number | null
          sent_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_followup_scheduled?: boolean | null
          bureau?: string
          cfpb_complaint_date?: string | null
          cfpb_complaint_filed?: boolean | null
          created_at?: string
          evidence_urls?: string[] | null
          id?: string
          item_id?: string | null
          letter_content?: string
          outcome?: string | null
          response_date?: string | null
          response_deadline?: string | null
          round_number?: number | null
          sent_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "flagged_items"
            referencedColumns: ["id"]
          },
        ]
      }
      email_preferences: {
        Row: {
          created_at: string | null
          id: string
          notify_analysis_complete: boolean | null
          notify_cfpb_escalation: boolean
          notify_dispute_deadline: boolean | null
          notify_followup_needed: boolean
          notify_score_update: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notify_analysis_complete?: boolean | null
          notify_cfpb_escalation?: boolean
          notify_dispute_deadline?: boolean | null
          notify_followup_needed?: boolean
          notify_score_update?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notify_analysis_complete?: boolean | null
          notify_cfpb_escalation?: boolean
          notify_dispute_deadline?: boolean | null
          notify_followup_needed?: boolean
          notify_score_update?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          component_name: string | null
          created_at: string | null
          error_message: string
          error_stack: string | null
          id: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_name?: string | null
          created_at?: string | null
          error_message: string
          error_stack?: string | null
          id?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_name?: string | null
          created_at?: string | null
          error_message?: string
          error_stack?: string | null
          id?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      flagged_items: {
        Row: {
          account_name: string
          account_type: string | null
          balance: number | null
          confidence_score: number | null
          created_at: string
          date_opened: string | null
          description: string | null
          id: string
          issue_type: string
          report_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_type?: string | null
          balance?: number | null
          confidence_score?: number | null
          created_at?: string
          date_opened?: string | null
          description?: string | null
          id?: string
          issue_type: string
          report_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_type?: string | null
          balance?: number | null
          confidence_score?: number | null
          created_at?: string
          date_opened?: string | null
          description?: string | null
          id?: string
          issue_type?: string
          report_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flagged_items_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "credit_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      goodwill_letters: {
        Row: {
          account_number: string | null
          created_at: string
          creditor_name: string
          id: string
          late_payment_date: string | null
          letter_content: string
          outcome: string | null
          reason: string | null
          relationship_length: string | null
          response_date: string | null
          sent_date: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          created_at?: string
          creditor_name: string
          id?: string
          late_payment_date?: string | null
          letter_content: string
          outcome?: string | null
          reason?: string | null
          relationship_length?: string | null
          response_date?: string | null
          sent_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          created_at?: string
          creditor_name?: string
          id?: string
          late_payment_date?: string | null
          letter_content?: string
          outcome?: string | null
          reason?: string | null
          relationship_length?: string | null
          response_date?: string | null
          sent_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      score_simulations: {
        Row: {
          created_at: string
          id: string
          projected_score: number | null
          simulation_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          projected_score?: number | null
          simulation_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          projected_score?: number | null
          simulation_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      score_snapshots: {
        Row: {
          bureau: string | null
          id: string
          notes: string | null
          score: number
          snapshot_date: string
          user_id: string
        }
        Insert: {
          bureau?: string | null
          id?: string
          notes?: string | null
          score: number
          snapshot_date?: string
          user_id: string
        }
        Update: {
          bureau?: string | null
          id?: string
          notes?: string | null
          score?: number
          snapshot_date?: string
          user_id?: string
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          created_at: string
          display_name: string
          final_score: number
          id: string
          initial_score: number
          is_approved: boolean
          items_removed: number
          testimony: string
          timeframe_months: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          final_score: number
          id?: string
          initial_score: number
          is_approved?: boolean
          items_removed?: number
          testimony: string
          timeframe_months: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          final_score?: number
          id?: string
          initial_score?: number
          is_approved?: boolean
          items_removed?: number
          testimony?: string
          timeframe_months?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
