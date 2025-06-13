export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_heads: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      accounts: {
        Row: {
          account_head_id: number | null
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          account_head_id?: number | null
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          account_head_id?: number | null
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_account_head_id_fkey"
            columns: ["account_head_id"]
            isOneToOne: false
            referencedRelation: "account_heads"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_accounts: {
        Row: {
          account_id: number | null
          balance: number | null
          created_at: string | null
          customer_id: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          account_id?: number | null
          balance?: number | null
          created_at?: string | null
          customer_id?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          account_id?: number | null
          balance?: number | null
          created_at?: string | null
          customer_id?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_accounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      employees: {
        Row: {
          id: string
          name: string | null
          transaction_count: number | null
        }
        Insert: {
          id: string
          name?: string | null
          transaction_count?: number | null
        }
        Update: {
          id?: string
          name?: string | null
          transaction_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employees_name_fkey"
            columns: ["name"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["username"]
          },
        ]
      }
      inventory_items: {
        Row: {
          cost_price: number | null
          created_at: string | null
          current_stock: number | null
          id: number
          name: string
          opening_stock: number | null
          quantity: number | null
          sale_price: number | null
          sku: string
          updated_at: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number | null
          id?: number
          name: string
          opening_stock?: number | null
          quantity?: number | null
          sale_price?: number | null
          sku: string
          updated_at?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number | null
          id?: number
          name?: string
          opening_stock?: number | null
          quantity?: number | null
          sale_price?: number | null
          sku?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          id: number
          item_id: number
          movement_date: string | null
          movement_type: string
          quantity: number
          transaction_id: number
          unit_cost: number
          user_id: string | null
        }
        Insert: {
          id?: number
          item_id: number
          movement_date?: string | null
          movement_type: string
          quantity: number
          transaction_id: number
          unit_cost: number
          user_id?: string | null
        }
        Update: {
          id?: number
          item_id?: number
          movement_date?: string | null
          movement_type?: string
          quantity?: number
          transaction_id?: number
          unit_cost?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transaction_items: {
        Row: {
          discount: number | null
          gross_amount: number | null
          id: number
          item_id: number
          quantity: number
          total_amount: number | null
          transaction_id: number
          unit_price: number
        }
        Insert: {
          discount?: number | null
          gross_amount?: number | null
          id?: number
          item_id: number
          quantity: number
          total_amount?: number | null
          transaction_id: number
          unit_price: number
        }
        Update: {
          discount?: number | null
          gross_amount?: number | null
          id?: number
          item_id?: number
          quantity?: number
          total_amount?: number | null
          transaction_id?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_reversal_requests: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transaction_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_reversal_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transaction_reversal_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transaction_reversal_requests_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          amount_paid: number | null
          created_at: string | null
          created_by: string | null
          credit_account_id: number | null
          debit_account_id: number | null
          description: string | null
          id: number
          misc_customer_name: string | null
          misc_vendor_name: string | null
          payment_status: string | null
          reference_transaction_ids: number[] | null
          transaction_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          created_at?: string | null
          created_by?: string | null
          credit_account_id?: number | null
          debit_account_id?: number | null
          description?: string | null
          id?: number
          misc_customer_name?: string | null
          misc_vendor_name?: string | null
          payment_status?: string | null
          reference_transaction_ids?: number[] | null
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          created_at?: string | null
          created_by?: string | null
          credit_account_id?: number | null
          debit_account_id?: number | null
          description?: string | null
          id?: number
          misc_customer_name?: string | null
          misc_vendor_name?: string | null
          payment_status?: string | null
          reference_transaction_ids?: number[] | null
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_credit_account_id_fkey"
            columns: ["credit_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_debit_account_id_fkey"
            columns: ["debit_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          password: string
          role: string
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          password: string
          role: string
          updated_at?: string | null
          user_id?: string
          username: string
        }
        Update: {
          created_at?: string | null
          password?: string
          role?: string
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      vendor_accounts: {
        Row: {
          account_id: number | null
          balance: number | null
          created_at: string | null
          id: number
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          account_id?: number | null
          balance?: number | null
          created_at?: string | null
          id?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          account_id?: number | null
          balance?: number | null
          created_at?: string | null
          id?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_accounts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_sql: {
        Args: { sql_query: string }
        Returns: Json
      }
      get_balance_sheet_supabase: {
        Args: Record<PropertyKey, never>
        Returns: {
          section: string
          account_name: string
          amount: string
        }[]
      }
      get_net_profit_loss: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_profit_summary_supabase: {
        Args: Record<PropertyKey, never>
        Returns: {
          item: string
          value: string
        }[]
      }
      get_total_bank_balance: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      process_transaction_reversal: {
        Args: { reversal_request_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
