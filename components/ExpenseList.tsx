import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types/database';

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  onDeleteExpense?: (id: string) => void;
  showDeleteButton?: boolean;
}

export default function ExpenseList({ expenses, loading, onDeleteExpense, showDeleteButton = true }: ExpenseListProps) {
  // Calculate total expenses per category
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (expense.category) {
      const categoryId = expense.category.id;
      acc[categoryId] = (acc[categoryId] || 0) + expense.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <ScrollView className="flex-1">
      {loading ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-gray-400">Loading...</Text>
        </View>
      ) : expenses.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-gray-400">No expenses yet</Text>
        </View>
      ) : (
        expenses.map((expense) => {
          const categoryTotal = expense.category ? categoryTotals[expense.category.id] : 0;
          const exceededAmount = expense.category?.limit 
            ? Math.max(0, categoryTotal - expense.category.limit)
            : 0;

          return (
            <View
              key={expense.id}
              className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <View className="flex-1 flex-row items-center">
                <View
                  className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                  // style={{ backgroundColor: expense.category?.color || '#666' }}
                  >
                  <Text className="text-2xl">{expense.category?.icon || '📁'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{expense.description}</Text>
                  <Text className="text-sm text-gray-400">
                    {new Date(expense.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  {exceededAmount > 0 && (
                    <Text className="mt-1 text-xs text-red-500">
                      Category limit exceeded by ₹{exceededAmount.toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-4 text-lg font-semibold text-red-600">
                  -₹{expense.amount.toLocaleString()}
                </Text>
                {showDeleteButton && onDeleteExpense && (
                  <TouchableOpacity onPress={() => onDeleteExpense(expense.id)} className="p-2">
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
} 