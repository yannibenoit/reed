
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "article_tags": {
                  Row: {
                    "article_id": string,"created_at": string,"tag_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "article_id": string,"created_at"?: string,"tag_id": string,"user_id": string
                  }
                  Update: {
                    "article_id"?: string,"created_at"?: string,"tag_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "article_tags_article_id_user_id_fkey"
      columns: ["article_id","user_id"]
isOneToOne: false
      referencedRelation: "articles"
      referencedColumns: ["id","user_id"]
    },{
      foreignKeyName: "article_tags_tag_id_user_id_fkey"
      columns: ["tag_id","user_id"]
isOneToOne: false
      referencedRelation: "tags"
      referencedColumns: ["id","user_id"]
    }
                  ]
                },"articles": {
                  Row: {
                    "archived_at": string | null,"author": string | null,"canonical_url": string,"content_html": string | null,"content_state": Database["public"]['Enums']["content_state"],"content_text": string | null,"estimated_minutes": number | null,"id": string,"manual_read": boolean,"read_at": string | null,"resaved_at": string | null,"saved_at": string,"source_domain": string | null,"status": Database["public"]['Enums']["article_status"],"title": string | null,"unavailable_reason": string | null,"updated_at": string,"url": string,"user_id": string,"word_count": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "archived_at"?: string | null,"author"?: string | null,"canonical_url": string,"content_html"?: string | null,"content_state"?: Database["public"]['Enums']["content_state"],"content_text"?: string | null,"estimated_minutes"?: number | null,"id"?: string,"manual_read"?: boolean,"read_at"?: string | null,"resaved_at"?: string | null,"saved_at"?: string,"source_domain"?: string | null,"status"?: Database["public"]['Enums']["article_status"],"title"?: string | null,"unavailable_reason"?: string | null,"updated_at"?: string,"url": string,"user_id": string,"word_count"?: number | null
                  }
                  Update: {
                    "archived_at"?: string | null,"author"?: string | null,"canonical_url"?: string,"content_html"?: string | null,"content_state"?: Database["public"]['Enums']["content_state"],"content_text"?: string | null,"estimated_minutes"?: number | null,"id"?: string,"manual_read"?: boolean,"read_at"?: string | null,"resaved_at"?: string | null,"saved_at"?: string,"source_domain"?: string | null,"status"?: Database["public"]['Enums']["article_status"],"title"?: string | null,"unavailable_reason"?: string | null,"updated_at"?: string,"url"?: string,"user_id"?: string,"word_count"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"daily_stats": {
                  Row: {
                    "articles_archived": number,"articles_opened": number,"articles_read": number,"articles_saved": number,"date": string,"goal_hit": boolean,"goal_minutes": number,"is_rest_day": boolean,"listen_minutes": number,"read_minutes": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "articles_archived"?: number,"articles_opened"?: number,"articles_read"?: number,"articles_saved"?: number,"date": string,"goal_hit"?: boolean,"goal_minutes": number,"is_rest_day"?: boolean,"listen_minutes"?: number,"read_minutes"?: number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "articles_archived"?: number,"articles_opened"?: number,"articles_read"?: number,"articles_saved"?: number,"date"?: string,"goal_hit"?: boolean,"goal_minutes"?: number,"is_rest_day"?: boolean,"listen_minutes"?: number,"read_minutes"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"goal_reviews": {
                  Row: {
                    "average_minutes": number,"created_at": string,"current_minutes": number,"days_counted": number,"days_hit": number,"decided_at": string | null,"decision": Database["public"]['Enums']["goal_review_decision"],"expires_at": string,"id": string,"period_end": string,"period_start": string,"proposed_minutes": number | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "average_minutes": number,"created_at"?: string,"current_minutes": number,"days_counted": number,"days_hit": number,"decided_at"?: string | null,"decision"?: Database["public"]['Enums']["goal_review_decision"],"expires_at"?: string,"id"?: string,"period_end": string,"period_start": string,"proposed_minutes"?: number | null,"user_id": string
                  }
                  Update: {
                    "average_minutes"?: number,"created_at"?: string,"current_minutes"?: number,"days_counted"?: number,"days_hit"?: number,"decided_at"?: string | null,"decision"?: Database["public"]['Enums']["goal_review_decision"],"expires_at"?: string,"id"?: string,"period_end"?: string,"period_start"?: string,"proposed_minutes"?: number | null,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"goals": {
                  Row: {
                    "locked": boolean,"minutes": number,"rest_days": (number)[],"review_weekday": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "locked"?: boolean,"minutes"?: number,"rest_days"?: (number)[],"review_weekday"?: number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "locked"?: boolean,"minutes"?: number,"rest_days"?: (number)[],"review_weekday"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"highlights": {
                  Row: {
                    "article_id": string,"created_at": string,"end_offset": number,"id": string,"prefix": string,"start_offset": number,"suffix": string,"text": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "article_id": string,"created_at"?: string,"end_offset": number,"id"?: string,"prefix"?: string,"start_offset": number,"suffix"?: string,"text": string,"user_id": string
                  }
                  Update: {
                    "article_id"?: string,"created_at"?: string,"end_offset"?: number,"id"?: string,"prefix"?: string,"start_offset"?: number,"suffix"?: string,"text"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "highlights_article_id_user_id_fkey"
      columns: ["article_id","user_id"]
isOneToOne: false
      referencedRelation: "articles"
      referencedColumns: ["id","user_id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"reader_prefs": NonNullable<Json>,"show_thumbnails": boolean,"time_zone": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"reader_prefs"?: NonNullable<Json>,"show_thumbnails"?: boolean,"time_zone"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"reader_prefs"?: NonNullable<Json>,"show_thumbnails"?: boolean,"time_zone"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"reading_progress": {
                  Row: {
                    "article_id": string,"device": string | null,"last_read_at": string | null,"listen_position": number | null,"max_scroll_pct": number,"opened_at": string | null,"scroll_pct": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "article_id": string,"device"?: string | null,"last_read_at"?: string | null,"listen_position"?: number | null,"max_scroll_pct"?: number,"opened_at"?: string | null,"scroll_pct"?: number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "article_id"?: string,"device"?: string | null,"last_read_at"?: string | null,"listen_position"?: number | null,"max_scroll_pct"?: number,"opened_at"?: string | null,"scroll_pct"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reading_progress_article_id_user_id_fkey"
      columns: ["article_id","user_id"]
isOneToOne: true
      referencedRelation: "articles"
      referencedColumns: ["id","user_id"]
    }
                  ]
                },"reading_sessions": {
                  Row: {
                    "active_seconds": number,"article_id": string | null,"client_id": string,"created_at": string,"device": string | null,"ended_at": string,"id": string,"mode": Database["public"]['Enums']["reading_mode"],"started_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active_seconds"?: number,"article_id"?: string | null,"client_id": string,"created_at"?: string,"device"?: string | null,"ended_at": string,"id"?: string,"mode"?: Database["public"]['Enums']["reading_mode"],"started_at": string,"user_id": string
                  }
                  Update: {
                    "active_seconds"?: number,"article_id"?: string | null,"client_id"?: string,"created_at"?: string,"device"?: string | null,"ended_at"?: string,"id"?: string,"mode"?: Database["public"]['Enums']["reading_mode"],"started_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reading_sessions_article_id_user_id_fkey"
      columns: ["article_id","user_id"]
isOneToOne: false
      referencedRelation: "articles"
      referencedColumns: ["id","user_id"]
    }
                  ]
                },"tags": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            [_ in never]: never
          }
          Enums: {
            "article_status": "unread"|"in_progress"|"read"|"archived","content_state": "pending"|"ready"|"unavailable","goal_review_decision": "pending"|"accepted"|"kept"|"locked"|"expired","reading_mode": "read"|"listen"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "article_status": ["unread", "in_progress", "read", "archived"],"content_state": ["pending", "ready", "unavailable"],"goal_review_decision": ["pending", "accepted", "kept", "locked", "expired"],"reading_mode": ["read", "listen"]
          }
        }
} as const
