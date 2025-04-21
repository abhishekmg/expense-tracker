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
  // Group expenses by category
  const categoryGroups = expenses.reduce((acc, expense) => {
    if (expense.category) {
      const categoryId = expense.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: expense.category,
          expenses: [],
          total: 0
        };
      }
      acc[categoryId].expenses.push(expense);
      acc[categoryId].total += expense.amount;
    }
    return acc;
  }, {} as Record<string, { category: NonNullable<Expense['category']>; expenses: Expense[]; total: number }>);

  const categoryList = Object.values(categoryGroups);

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
        categoryList.map((group) => {
          const exceededAmount = group.category.limit 
            ? Math.max(0, group.total - group.category.limit)
            : 0;

          return (
            <View
              key={group.category.id}
              className="border-b border-gray-100 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white"
                    // style={{ backgroundColor: group.category.color }}
                    >
                    <Text className="text-4xl">{group.category.icon}</Text>
                  </View>
                  <View>
                    <Text className="font-medium text-gray-900">{group.category.name}</Text>
                    <Text className="text-sm text-gray-400">
                      {group.expenses.length} {group.expenses.length === 1 ? 'expense' : 'expenses'}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-semibold text-red-600">
                    -₹{group.total.toLocaleString()}
                  </Text>
                  {exceededAmount > 0 && (
                    <Text className="text-xs text-red-500">
                      Exceeded by ₹{exceededAmount.toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Individual expenses under each category */}
              {group.expenses.map((expense) => (
                <View
                  key={expense.id}
                  className="ml-4 mt-2 flex-row items-center justify-between border-l-2 border-gray-100 pl-4">
                  <View className="flex-1">
                    <Text className="text-gray-600">{expense.description}</Text>
                    <Text className="text-xs text-gray-400">
                      {new Date(expense.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="mr-4 text-gray-600">
                      -₹{expense.amount.toLocaleString()}
                    </Text>
                    {showDeleteButton && onDeleteExpense && (
                      <TouchableOpacity onPress={() => onDeleteExpense(expense.id)} className="p-2">
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })
      )}
    </ScrollView>
  );
} 