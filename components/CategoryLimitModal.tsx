import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types/database';
import { updateCategory } from '../services/database';

type Props = {
  category: Category;
  onClose: () => void;
  onUpdate: () => void;
};

export default function CategoryLimitModal({ category, onClose, onUpdate }: Props) {
  const [limit, setLimit] = useState(category.limit?.toString() || '');

  const handleSave = async () => {
    try {
      const limitNum = limit ? parseFloat(limit) : null;
      if (limitNum !== null && (isNaN(limitNum) || limitNum <= 0)) {
        Alert.alert('Error', 'Please enter a valid limit amount');
        return;
      }

      await updateCategory(category.id, { limit: limitNum });
      onUpdate();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update category limit');
    }
  };

  return (
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Set Category Limit</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <Text className="text-gray-500 mb-1">Category: {category.name}</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
          <Text className="text-gray-500 mr-2">₹</Text>
          <TextInput
            className="flex-1 text-lg"
            placeholder="Enter limit (optional)"
            value={limit}
            onChangeText={(text) => {
              // Only allow numbers and decimal point
              const numericValue = text.replace(/[^0-9.]/g, '');
              // Ensure only one decimal point
              const parts = numericValue.split('.');
              if (parts.length > 2) {
                return;
              }
              // Limit to 2 decimal places
              if (parts[1] && parts[1].length > 2) {
                return;
              }
              setLimit(numericValue);
            }}
            keyboardType="decimal-pad"
          />
        </View>
        <Text className="text-gray-400 text-sm mt-1">
          Leave empty for no limit
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleSave}
        className="bg-blue-600 rounded-lg p-4"
      >
        <Text className="text-white text-center font-medium">Save Limit</Text>
      </TouchableOpacity>
    </View>
  );
} 