import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddTransactionModal from '../components/AddTransactionModal';

type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: Date;
  type: 'expense' | 'income';
};

export default function MainScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const totalBalance = transactions.reduce((sum, transaction) => {
    return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }, 0);

  const handleAddTransaction = (amount: number, description: string, type: 'expense' | 'income') => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount,
      description,
      date: new Date(),
      type,
    };
    setTransactions([newTransaction, ...transactions]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Total Balance */}
      <View className="p-4 bg-gray-50">
        <Text className="text-gray-500 text-sm">Total Balance</Text>
        <Text className="text-3xl font-bold text-gray-900">₹{totalBalance.toLocaleString()}</Text>
      </View>

      {/* Transactions List */}
      <ScrollView className="flex-1">
        {transactions.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-gray-400">No transactions yet</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <View
              key={transaction.id}
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
            >
              <View>
                <Text className="text-gray-900 font-medium">{transaction.description}</Text>
                <Text className="text-gray-400 text-sm">
                  {transaction.date.toLocaleDateString()}
                </Text>
              </View>
              <Text
                className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <View className="absolute bottom-4 right-4">
        <TouchableOpacity
          className="bg-blue-600 rounded-full w-16 h-16 items-center justify-center shadow-lg"
          onPress={() => setShowAddModal(true)}
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTransaction={handleAddTransaction}
      />
    </SafeAreaView>
  );
} 