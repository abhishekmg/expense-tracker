import { supabase } from '../utils/supabase';
import { Expense, Category } from '../types/database';

export const getExpenses = async (month?: number): Promise<Expense[]> => {
  let query = supabase
    .from('expenses')
    .select(
      `
      *,
      category:categories (
        id,
        name,
        icon,
        color,
        limit
      )
    `
    )
    .order('created_at', { ascending: false });

  if (month !== undefined) {
    const startDate = new Date();
    startDate.setMonth(month);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMonth(month + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59, 999);

    query = query
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const addExpense = async (
  expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>
): Promise<Expense> => {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select(`
      *,
      category:categories (
        id,
        name,
        icon,
        color,
        limit
      )
    `)
    .single();

  if (error) throw error;
  return data;
};

export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  const { error } = await supabase.from('expenses').delete().eq('id', id);

  if (error) throw error;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*').order('name');

  if (error) throw error;
  return data;
};

export const addCategory = async (
  category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
): Promise<Category> => {
  const { data, error } = await supabase.from('categories').insert(category).select().single();

  if (error) throw error;
  return data;
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) throw error;
};

// Default categories that will be created for new users
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] =
  [
    {
      name: 'Food & Dining',
      icon: 'restaurant',
      color: '#F59E0B',
      is_default: true,
      limit: null,
    },
    {
      name: 'Transportation',
      icon: 'car',
      color: '#3B82F6',
      is_default: true,
      limit: null,
    },
    {
      name: 'Shopping',
      icon: 'cart',
      color: '#8B5CF6',
      is_default: true,
      limit: null,
    },
    {
      name: 'Entertainment',
      icon: 'game-controller',
      color: '#EC4899',
      is_default: true,
      limit: null,
    },
    {
      name: 'Bills & Utilities',
      icon: 'receipt',
      color: '#10B981',
      is_default: true,
      limit: null,
    },
    {
      name: 'Healthcare',
      icon: 'medkit',
      color: '#EF4444',
      is_default: true,
      limit: null,
    },
  ];
