import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddTransactionModal from '../components/AddTransactionModal';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

type Expense = {
  id: string;
  amount: number;
  description: string;
  date: Date;
};

export default function ExpenseScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleAddExpense = (amount: number, description: string) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount,
      description,
      date: new Date(),
    };
    setExpenses([newExpense, ...expenses]);
    bottomSheetModalRef.current?.dismiss();
  };

  const handlePresentModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Total Expense */}
      <View className="bg-gray-50 p-4">
        <Text className="text-sm text-gray-500">Total Expense</Text>
        <Text className="text-3xl font-bold text-gray-900">₹{totalExpense.toLocaleString()}</Text>
      </View>

      {/* Expenses List */}
      <ScrollView className="flex-1">
        {expenses.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-gray-400">No expenses yet</Text>
          </View>
        ) : (
          expenses.map((expense) => (
            <View
              key={expense.id}
              className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <View>
                <Text className="font-medium text-gray-900">{expense.description}</Text>
                <Text className="text-sm text-gray-400">
                  {expense.date.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <Text className="text-lg font-semibold text-red-600">
                -₹{expense.amount.toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <View className="absolute bottom-4 right-4">
        <TouchableOpacity
          className="h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg"
          onPress={handlePresentModal}>
          <Text className="text-2xl font-bold text-white">+</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={undefined}
        enableDynamicSizing
        enablePanDownToClose={false}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
        )}>
        <BottomSheetView>
          <AddTransactionModal
            onAddTransaction={handleAddExpense}
            onClose={() => bottomSheetModalRef.current?.dismiss()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
