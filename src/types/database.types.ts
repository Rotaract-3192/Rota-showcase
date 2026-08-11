/**
 * Auto-generated database types via custom schema reflection.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      access_requests: {
        Row: {
          id: string
          club_id: string
          requested_role: string
          full_name: string
          email: string
          phone: string | null
          status: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          zone: string | null
        }
        Insert: {
          id?: string
          club_id: string
          requested_role: string
          full_name: string
          email: string
          phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          zone?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          requested_role?: string
          full_name?: string
          email?: string
          phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          club_id: string | null
          title: string
          slug: string
          type: 'EVENT' | 'PROJECT'
          description: string
          start_time: string
          end_time: string
          venue: string | null
          status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
          created_at: string
          updated_at: string
          deleted_at: string | null
          activity_category: string | null
          is_external_ngo: boolean | null
          organization_name: string | null
          avenues: any | null
          focus_areas: any | null
          activity_expenses: number | null
          cash_contribution: number | null
          in_kind_contribution: number | null
          participants: number | null
          beneficiaries: number | null
          volunteers: number | null
          volunteer_hours: number | null
          submit_for_publication: boolean | null
          feature_activity: boolean | null
          cover_image: string | null
          supporting_image_1: string | null
          supporting_image_2: string | null
        }
        Insert: {
          id?: string
          club_id?: string | null
          title: string
          slug: string
          type: 'EVENT' | 'PROJECT'
          description: string
          start_time: string
          end_time: string
          venue?: string | null
          status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          activity_category?: string | null
          is_external_ngo?: boolean | null
          organization_name?: string | null
          avenues?: any | null
          focus_areas?: any | null
          activity_expenses?: number | null
          cash_contribution?: number | null
          in_kind_contribution?: number | null
          participants?: number | null
          beneficiaries?: number | null
          volunteers?: number | null
          volunteer_hours?: number | null
          submit_for_publication?: boolean | null
          feature_activity?: boolean | null
          cover_image?: string | null
          supporting_image_1?: string | null
          supporting_image_2?: string | null
        }
        Update: {
          id?: string
          club_id?: string | null
          title?: string
          slug?: string
          type?: 'EVENT' | 'PROJECT'
          description?: string
          start_time?: string
          end_time?: string
          venue?: string | null
          status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          activity_category?: string | null
          is_external_ngo?: boolean | null
          organization_name?: string | null
          avenues?: any | null
          focus_areas?: any | null
          activity_expenses?: number | null
          cash_contribution?: number | null
          in_kind_contribution?: number | null
          participants?: number | null
          beneficiaries?: number | null
          volunteers?: number | null
          volunteer_hours?: number | null
          submit_for_publication?: boolean | null
          feature_activity?: boolean | null
          cover_image?: string | null
          supporting_image_1?: string | null
          supporting_image_2?: string | null
        }
        Relationships: []
      }
      ai_jobs: {
        Row: {
          id: string
          resource_type: string
          resource_id: string
          status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
          result_payload: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          resource_type: string
          resource_id: string
          status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
          result_payload?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          resource_type?: string
          resource_id?: string
          status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
          result_payload?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: string
          event_name: string
          payload: Json | null
          user_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          event_name: string
          payload?: Json | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          event_name?: string
          payload?: Json | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          sender: string
          target_audience: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          sender: string
          target_audience: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          sender?: string
          target_audience?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          table_name: string
          record_id: string
          action: string
          old_data: Json | null
          new_data: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          actor_id?: string | null
          table_name: string
          record_id: string
          action: string
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          actor_id?: string | null
          table_name?: string
          record_id?: string
          action?: string
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      club_leaders_directory: {
        Row: {
          id: string
          club_name: string
          club_type: string | null
          club_email: string | null
          partner_club: string | null
          name: string
          designation: string
          phone: string | null
          email: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          club_name: string
          club_type?: string | null
          club_email?: string | null
          partner_club?: string | null
          name: string
          designation: string
          phone?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          club_name?: string
          club_type?: string | null
          club_email?: string | null
          partner_club?: string | null
          name?: string
          designation?: string
          phone?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      club_website_configs: {
        Row: {
          id: string
          club_id: string
          theme_color: string | null
          hero_text: string | null
          social_links: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          club_id: string
          theme_color?: string | null
          hero_text?: string | null
          social_links?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          theme_color?: string | null
          hero_text?: string | null
          social_links?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      clubs: {
        Row: {
          id: string
          district_id: string
          name: string
          slug: string
          status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          founded_date: string | null
          charter_date: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          zone: string | null
          club_type: string | null
          club_email: string | null
          partner_rotary_club: string | null
          member_count: number | null
          total_projects: number | null
          total_points: number | null
          description: string | null
          email: string | null
        }
        Insert: {
          id?: string
          district_id: string
          name: string
          slug: string
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          founded_date?: string | null
          charter_date?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          zone?: string | null
          club_type?: string | null
          club_email?: string | null
          partner_rotary_club?: string | null
          member_count?: number | null
          total_projects?: number | null
          total_points?: number | null
          description?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          district_id?: string
          name?: string
          slug?: string
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          founded_date?: string | null
          charter_date?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          zone?: string | null
          club_type?: string | null
          club_email?: string | null
          partner_rotary_club?: string | null
          member_count?: number | null
          total_projects?: number | null
          total_points?: number | null
          description?: string | null
          email?: string | null
        }
        Relationships: []
      }
      cron_jobs: {
        Row: {
          id: string
          task_name: string
          schedule: string
          last_run: string | null
          next_run: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          task_name: string
          schedule: string
          last_run?: string | null
          next_run?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          task_name?: string
          schedule?: string
          last_run?: string | null
          next_run?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      district_settings: {
        Row: {
          id: string
          general: Json | null
          branding: Json | null
          security: Json | null
          notifications: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          general?: Json | null
          branding?: Json | null
          security?: Json | null
          notifications?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          general?: Json | null
          branding?: Json | null
          security?: Json | null
          notifications?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      districts: {
        Row: {
          id: string
          name: string
          number: string
          logo_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          number: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          number?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      dovs: {
        Row: {
          id: string
          club_id: string
          visiting_official_id: string
          date: string
          evaluation_score: number | null
          remarks: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          title: string | null
          cover_image: string | null
          supporting_image_1: string | null
          supporting_image_2: string | null
        }
        Insert: {
          id?: string
          club_id: string
          visiting_official_id: string
          date: string
          evaluation_score?: number | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          title?: string | null
          cover_image?: string | null
          supporting_image_1?: string | null
          supporting_image_2?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          visiting_official_id?: string
          date?: string
          evaluation_score?: number | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          title?: string | null
          cover_image?: string | null
          supporting_image_1?: string | null
          supporting_image_2?: string | null
        }
        Relationships: []
      }
      installations: {
        Row: {
          id: string
          club_id: string
          date: string
          venue: string | null
          incoming_president_id: string
          chief_guest: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          name: string | null
          start_time: string | null
          end_time: string | null
          cover_image: string | null
          supporting_image_1: string | null
          supporting_image_2: string | null
        }
        Insert: {
          id?: string
          club_id: string
          date: string
          venue?: string | null
          incoming_president_id: string
          chief_guest?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          name?: string | null
          start_time?: string | null
          end_time?: string | null
          cover_image?: string | null
          supporting_image_1?: string | null
          supporting_image_2?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          date?: string
          venue?: string | null
          incoming_president_id?: string
          chief_guest?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          name?: string | null
          start_time?: string | null
          end_time?: string | null
          cover_image?: string | null
          supporting_image_1?: string | null
          supporting_image_2?: string | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          id: string
          club_id: string
          date: string
          minutes_text: string | null
          attendees_count: number | null
          audio_url: string | null
          transcript_text: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          title: string | null
          venue: string | null
          start_time: string | null
          end_time: string | null
          meeting_type: string | null
          cover_image: string | null
          supporting_image_1: string | null
          supporting_image_2: string | null
        }
        Insert: {
          id?: string
          club_id: string
          date: string
          minutes_text?: string | null
          attendees_count?: number | null
          audio_url?: string | null
          transcript_text?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          title?: string | null
          venue?: string | null
          start_time?: string | null
          end_time?: string | null
          meeting_type?: string | null
          cover_image?: string | null
          supporting_image_1?: string | null
          supporting_image_2?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          date?: string
          minutes_text?: string | null
          attendees_count?: number | null
          audio_url?: string | null
          transcript_text?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          title?: string | null
          venue?: string | null
          start_time?: string | null
          end_time?: string | null
          meeting_type?: string | null
          cover_image?: string | null
          supporting_image_1?: string | null
          supporting_image_2?: string | null
        }
        Relationships: []
      }
      member_profiles: {
        Row: {
          id: string
          auth_id: string | null
          club_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          blood_group: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          auth_id?: string | null
          club_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          blood_group?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          auth_id?: string | null
          club_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          blood_group?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      member_roles: {
        Row: {
          id: string
          member_id: string
          role: string
          club_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          zone: string | null
        }
        Insert: {
          id?: string
          member_id: string
          role: string
          club_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          zone?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          role?: string
          club_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          role_target: string | null
          title: string
          message: string | null
          link: string | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          role_target?: string | null
          title: string
          message?: string | null
          link?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          role_target?: string | null
          title?: string
          message?: string | null
          link?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      orientations: {
        Row: {
          id: string
          club_id: string
          date: string
          speaker_name: string | null
          new_members_inducted: number | null
          remarks: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          name: string | null
          venue: string | null
          start_time: string | null
          end_time: string | null
          orientation_type: string | null
          cover_image: string | null
          supporting_image_1: string | null
          supporting_image_2: string | null
        }
        Insert: {
          id?: string
          club_id: string
          date: string
          speaker_name?: string | null
          new_members_inducted?: number | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          name?: string | null
          venue?: string | null
          start_time?: string | null
          end_time?: string | null
          orientation_type?: string | null
          cover_image?: string | null
          supporting_image_1?: string | null
          supporting_image_2?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          date?: string
          speaker_name?: string | null
          new_members_inducted?: number | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          name?: string | null
          venue?: string | null
          start_time?: string | null
          end_time?: string | null
          orientation_type?: string | null
          cover_image?: string | null
          supporting_image_1?: string | null
          supporting_image_2?: string | null
        }
        Relationships: []
      }
      point_ledgers: {
        Row: {
          id: string
          club_id: string
          member_id: string
          points: number
          reason: string
          awarded_at: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          club_id: string
          member_id: string
          points: number
          reason: string
          awarded_at?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          member_id?: string
          points?: number
          reason?: string
          awarded_at?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          id: string
          activity_id: string
          member_id: string
          status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          activity_id: string
          member_id: string
          status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          activity_id?: string
          member_id?: string
          status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      showcase_features: {
        Row: {
          id: string
          activity_id: string
          title: string
          highlight_image_url: string
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          activity_id: string
          title: string
          highlight_image_url: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          activity_id?: string
          title?: string
          highlight_image_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      activity_status_enum: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
      activity_type_enum: 'EVENT' | 'PROJECT'
      ai_job_status_enum: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
      club_status_enum: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
      registration_status_enum: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
    }
    CompositeTypes: Record<string, never>
  }
}
