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
      kak_users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          auth_password: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          auth_password?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          auth_password?: string | null
          created_at?: string
        }
        Relationships: []
      }
      kak_tax_years: {
        Row: {
          id: string
          user_id: string
          year: number
          declaration_type: 'blue' | 'white'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          year: number
          declaration_type?: 'blue' | 'white'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          year?: number
          declaration_type?: 'blue' | 'white'
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'kak_tax_years_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'kak_users'
            referencedColumns: ['id']
          },
        ]
      }
      kak_categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          icon: string | null
          sort_order: number
          is_default: boolean
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          icon?: string | null
          sort_order?: number
          is_default?: boolean
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          icon?: string | null
          sort_order?: number
          is_default?: boolean
        }
        Relationships: []
      }
      kak_receipts: {
        Row: {
          id: string
          user_id: string
          storage_path: string
          original_filename: string | null
          ocr_raw_text: string | null
          ocr_status: 'pending' | 'processing' | 'done' | 'error'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          storage_path: string
          original_filename?: string | null
          ocr_raw_text?: string | null
          ocr_status?: 'pending' | 'processing' | 'done' | 'error'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          storage_path?: string
          original_filename?: string | null
          ocr_raw_text?: string | null
          ocr_status?: 'pending' | 'processing' | 'done' | 'error'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'kak_receipts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'kak_users'
            referencedColumns: ['id']
          },
        ]
      }
      kak_transactions: {
        Row: {
          id: string
          user_id: string
          tax_year_id: string
          type: 'income' | 'expense'
          amount: number
          date: string
          description: string | null
          category_id: string | null
          receipt_id: string | null
          ai_suggested: boolean
          memo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tax_year_id: string
          type: 'income' | 'expense'
          amount: number
          date: string
          description?: string | null
          category_id?: string | null
          receipt_id?: string | null
          ai_suggested?: boolean
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tax_year_id?: string
          type?: 'income' | 'expense'
          amount?: number
          date?: string
          description?: string | null
          category_id?: string | null
          receipt_id?: string | null
          ai_suggested?: boolean
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'kak_transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'kak_users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'kak_transactions_tax_year_id_fkey'
            columns: ['tax_year_id']
            isOneToOne: false
            referencedRelation: 'kak_tax_years'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'kak_transactions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'kak_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'kak_transactions_receipt_id_fkey'
            columns: ['receipt_id']
            isOneToOne: false
            referencedRelation: 'kak_receipts'
            referencedColumns: ['id']
          },
        ]
      }
      kak_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          sent_at: string
          status: 'sent' | 'failed'
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          sent_at?: string
          status?: 'sent' | 'failed'
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          sent_at?: string
          status?: 'sent' | 'failed'
        }
        Relationships: [
          {
            foreignKeyName: 'kak_notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'kak_users'
            referencedColumns: ['id']
          },
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
      [_ in never]: never
    }
  }
}
