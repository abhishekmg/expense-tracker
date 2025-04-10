import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AddTransactionModal from '../components/AddTransactionModal';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useAuth, AuthProvider } from '../store/AuthContext';
import { getExpenses, addExpense, deleteExpense } from '../services/database';
import { Expense } from '../types/database';
import { useNavigation } from '@react-navigation/native';

export default function ExpenseScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const optionsBottomSheetRef = useRef<BottomSheetModal>(null);
  const { signOut, session } = useAuth();
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation();

  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (
    amount: number,
    description: string,
    categoryId: string | null
  ) => {
    try {
      const newExpense = await addExpense({
        amount,
        description,
        category_id: categoryId,
        user_id: session?.user?.id || '',
        metadata: {},
      });
      setExpenses([newExpense, ...expenses]);
      bottomSheetModalRef.current?.dismiss();
    } catch (error) {
      console.log('error', error);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter((expense) => expense.id !== id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete expense');
    }
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
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with Options Button */}
      <TouchableOpacity
        onPress={handlePresentOptionsModal}
        className="h-10 w-10 items-center justify-center">
        <Ionicons name="options-outline" size={24} color="#000" />
      </TouchableOpacity>

      {/* Total Expense Display */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-5xl font-bold text-gray-900">₹{totalExpense.toLocaleString()}</Text>
        <Text className="mt-2 text-gray-500">Total Expenses</Text>
      </View>

      {/* Expenses List */}
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
          expenses.map((expense) => (
            <View
              key={expense.id}
              className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <View className="flex-1 flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons 
                    name={expense.category?.icon || 'folder'} 
                    size={20} 
                    color={expense.category?.color || '#666'} 
                  />
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
                </View>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-4 text-lg font-semibold text-red-600">
                  -₹{expense.amount.toLocaleString()}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteExpense(expense.id)} className="p-2">
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <View className="absolute bottom-4 right-4 flex-row" style={{ bottom: bottom + 16 }}>
        <TouchableOpacity
          className="h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg mr-4"
          onPress={() => navigation.navigate('Reports')}>
          <Ionicons name="bar-chart" size={24} color="white" />
        </TouchableOpacity>
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
        <BottomSheetView style={{ paddingBottom: bottom }}>
          <AddTransactionModal
            onAddTransaction={handleAddExpense}
            onClose={() => bottomSheetModalRef.current?.dismiss()}
            session={session}
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
          <Text className="text-md mb-4 text-gray-500">{session?.user?.email}</Text>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center border-b border-gray-100 p-4">
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text className="ml-3 font-medium text-red-500">Logout</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}