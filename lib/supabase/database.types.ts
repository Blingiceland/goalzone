export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Enums: {
      app_role: "viewer" | "pending_uploader" | "uploader" | "admin";
      highlight_status: "pending" | "approved" | "rejected";
      highlight_type:
        | "goal"
        | "save"
        | "skill"
        | "assist"
        | "shot"
        | "mistake"
        | "funny"
        | "celebration"
        | "historic"
        | "other";
      uploader_application_status: "pending" | "approved" | "rejected";
    };
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          role: Database["public"]["Enums"]["app_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          display_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      uploader_applications: {
        Row: {
          id: string;
          user_id: string;
          club_name: string;
          team_name: string | null;
          contact_email: string;
          reason: string;
          status: Database["public"]["Enums"]["uploader_application_status"];
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          club_name: string;
          team_name?: string | null;
          contact_email: string;
          reason: string;
          status?: Database["public"]["Enums"]["uploader_application_status"];
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          club_name?: string;
          team_name?: string | null;
          contact_email?: string;
          reason?: string;
          status?: Database["public"]["Enums"]["uploader_application_status"];
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "uploader_applications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "uploader_applications_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          city: string | null;
          country: string;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          city?: string | null;
          country?: string;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          city?: string | null;
          country?: string;
          logo_url?: string | null;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          club_id: string;
          name: string;
          age_group: string | null;
          gender: string | null;
          season: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          name: string;
          age_group?: string | null;
          gender?: string | null;
          season?: string | null;
          created_at?: string;
        };
        Update: {
          club_id?: string;
          name?: string;
          age_group?: string | null;
          gender?: string | null;
          season?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_en: string;
          name_is: string;
          short_description_is: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_en: string;
          name_is: string;
          short_description_is?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name_en?: string;
          name_is?: string;
          short_description_is?: string | null;
          display_order?: number;
        };
        Relationships: [];
      };
      highlights: {
        Row: {
          id: string;
          uploader_id: string;
          category_id: string | null;
          club_id: string | null;
          team_id: string | null;
          title: string;
          description: string | null;
          type: Database["public"]["Enums"]["highlight_type"];
          status: Database["public"]["Enums"]["highlight_status"];
          player_name: string | null;
          club_name: string | null;
          team_name: string | null;
          opponent_team_name: string | null;
          competition: string | null;
          season: string | null;
          match_date: string | null;
          location: string | null;
          video_path: string | null;
          video_url: string | null;
          video_provider: string | null;
          external_video_url: string | null;
          external_video_provider: string | null;
          thumbnail_path: string | null;
          recorded_at: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          uploader_id: string;
          category_id?: string | null;
          club_id?: string | null;
          team_id?: string | null;
          title: string;
          description?: string | null;
          type: Database["public"]["Enums"]["highlight_type"];
          status?: Database["public"]["Enums"]["highlight_status"];
          player_name?: string | null;
          club_name?: string | null;
          team_name?: string | null;
          opponent_team_name?: string | null;
          competition?: string | null;
          season?: string | null;
          match_date?: string | null;
          location?: string | null;
          video_path?: string | null;
          video_url?: string | null;
          video_provider?: string | null;
          external_video_url?: string | null;
          external_video_provider?: string | null;
          thumbnail_path?: string | null;
          recorded_at?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          club_id?: string | null;
          category_id?: string | null;
          team_id?: string | null;
          title?: string;
          description?: string | null;
          type?: Database["public"]["Enums"]["highlight_type"];
          status?: Database["public"]["Enums"]["highlight_status"];
          player_name?: string | null;
          club_name?: string | null;
          team_name?: string | null;
          opponent_team_name?: string | null;
          competition?: string | null;
          season?: string | null;
          match_date?: string | null;
          location?: string | null;
          video_path?: string | null;
          video_url?: string | null;
          video_provider?: string | null;
          external_video_url?: string | null;
          external_video_provider?: string | null;
          thumbnail_path?: string | null;
          recorded_at?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "highlights_uploader_id_fkey";
            columns: ["uploader_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "highlights_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "highlights_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "highlights_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "highlights_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
