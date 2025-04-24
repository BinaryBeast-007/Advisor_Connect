export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string | null
          role: string | null
          phone: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name?: string | null
          role?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string | null
          role?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      advisors: {
        Row: {
          id: string
          user_id: string
          registration_number: string | null
          registration_type: string | null
          years_of_experience: number | null
          languages: string[] | null
          about_me: string | null
          profile_picture_url: string | null
          profile_picture_hash: string | null
          is_verified: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          registration_number?: string | null
          registration_type?: string | null
          years_of_experience?: number | null
          languages?: string[] | null
          about_me?: string | null
          profile_picture_url?: string | null
          profile_picture_hash?: string | null
          is_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          registration_number?: string | null
          registration_type?: string | null
          years_of_experience?: number | null
          languages?: string[] | null
          about_me?: string | null
          profile_picture_url?: string | null
          profile_picture_hash?: string | null
          is_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      advisor_packages: {
        Row: {
          id: string
          advisor_id: string
          title: string
          subtitle: string | null
          price: number
          duration: number
          features: string[]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          advisor_id: string
          title: string
          subtitle?: string | null
          price: number
          duration: number
          features?: string[]
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          advisor_id?: string
          title?: string
          subtitle?: string | null
          price?: number
          duration?: number
          features?: string[]
          created_at?: string | null
          updated_at?: string | null
        }
      }
      advisor_reviews: {
        Row: {
          id: string
          advisor_id: string
          customer_id: string
          rating: number
          comment: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          advisor_id: string
          customer_id: string
          rating: number
          comment?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          advisor_id?: string
          customer_id?: string
          rating?: number
          comment?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      advisor_profiles: {
        Row: {
          id: string
          registration_number: string | null
          registration_type: string | null
          years_of_experience: number | null
          languages: string[] | null
          about_me: string | null
          profile_picture_url: string | null
          profile_picture_hash: string | null
          is_verified: boolean | null
          created_at: string | null
          updated_at: string | null
          user_id: string
          full_name: string | null
          email: string
          phone: string | null
        }
      }
      advisor_review_details: {
        Row: {
          id: string
          advisor_id: string
          customer_id: string
          rating: number
          comment: string | null
          created_at: string | null
          reviewer_name: string | null
        }
      }
    }
  }
}