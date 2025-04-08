export type Category = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
  is_default: boolean;
};

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}; 