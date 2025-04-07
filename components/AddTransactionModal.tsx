import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onAddTransaction: (amount: number, description: string) => void;
  onClose: () => void;
};

export default function AddTransactionModal({ onClose, onAddTransaction }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const { bottom } = useSafeAreaInsets();

  console.log(bottom);

  const handleSubmit = () => {
    if (!amount || !description) return;
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return;

    onAddTransaction(numericAmount, description);
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <View className="p-6" style={{ paddingBottom: bottom }}>
      <View className="flex-row justify-between mb-6">
        <Text className="text-xl font-bold text-gray-900">Add Expense</Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-gray-500">Cancel</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="border border-gray-200 rounded-lg p-4 mb-4"
        placeholder="Amount (₹)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        className="border border-gray-200 rounded-lg p-4 mb-6"
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        className="bg-red-600 rounded-lg p-4"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center font-semibold">Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
} 