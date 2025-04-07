import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AddTransactionModal from '../components/AddTransactionModal';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useAuth } from '../store/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Expense = {
  id: string;
  amount: number;
  description: string;
  date: Date;
};

export default function ExpenseScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const optionsBottomSheetRef = useRef<BottomSheetModal>(null);
  const { signOut, session } = useAuth();
  const { bottom } = useSafeAreaInsets();
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

  const handlePresentOptionsModal = useCallback(() => {
    optionsBottomSheetRef.current?.present();
  }, []);

  const handleLogout = async () => {
    await signOut();
    optionsBottomSheetRef.current?.dismiss();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with Options Button */}
        <TouchableOpacity
          onPress={handlePresentOptionsModal}
          className="w-10 h-10 items-center justify-center pl-2"
        >
          <Ionicons name="options-outline" size={24} color="#000" />
        </TouchableOpacity>

      {/* Total Expense Display */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-5xl font-bold text-gray-900">₹{totalExpense.toLocaleString()}</Text>
        <Text className="text-gray-500 mt-2">Total Expenses</Text>
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
      <View className="absolute bottom-4 right-4" style={{ bottom: bottom + 16 }}>
        <TouchableOpacity
          className="h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg"
          onPress={handlePresentModal}>
          <Text className="text-2xl font-bold text-white">+</Text>
        </TouchableOpacity>
      </View>

      {/* Add Expense Bottom Sheet */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={undefined}
        enableDynamicSizing
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}>
        <BottomSheetView>
          <AddTransactionModal
            onAddTransaction={handleAddExpense}
            onClose={() => bottomSheetModalRef.current?.dismiss()}
          />
        </BottomSheetView>
      </BottomSheetModal>

      {/* Options Bottom Sheet */}
      <BottomSheetModal
        ref={optionsBottomSheetRef}
        snapPoints={undefined}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}>
        <BottomSheetView className="p-4" style={{ paddingBottom: bottom }}>
          <Text className="text-gray-500 text-md mb-4">
            {session?.user?.email}
          </Text>
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text className="text-red-500 ml-3 font-medium">Logout</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
