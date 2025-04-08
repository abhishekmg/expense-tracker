import { supabase } from '../utils/supabase';
import { Expense, Category } from '../types/database';

export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> => {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
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
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

export const addCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();

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
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Default categories that will be created for new users
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Food & Dining',
    icon: 'restaurant',
    color: '#F59E0B',
    is_default: true,
  },
  {
    name: 'Transportation',
    icon: 'car',
    color: '#3B82F6',
    is_default: true,
  },
  {
    name: 'Shopping',
    icon: 'cart',
    color: '#8B5CF6',
    is_default: true,
  },
  {
    name: 'Entertainment',
    icon: 'game-controller',
    color: '#EC4899',
    is_default: true,
  },
  {
    name: 'Bills & Utilities',
    icon: 'receipt',
    color: '#10B981',
    is_default: true,
  },
  {
    name: 'Healthcare',
    icon: 'medkit',
    color: '#EF4444',
    is_default: true,
  },
]; 