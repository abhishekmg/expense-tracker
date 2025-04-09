import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategories, addCategory, getExpenses } from '../services/database';
import { Category, Expense } from '../types/database';
import { Session } from '@supabase/supabase-js';
import CategoryLimitModal from './CategoryLimitModal';

type Props = {
  onAddTransaction: (amount: number, description: string, categoryId: string | null) => void;
  onClose: () => void;
  session: Session | null;
};

export default function AddTransactionModal({ onAddTransaction, onClose, session }: Props) {
  const [amountInput, setAmountInput] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('folder');
  const [loading, setLoading] = useState(true);
  const [categoryExpenses, setCategoryExpenses] = useState<Record<string, number>>({});
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedCategoryForLimit, setSelectedCategoryForLimit] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchCategoryExpenses();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryExpenses = async () => {
    try {
      const expenses = await getExpenses();
      const categoryTotals: Record<string, number> = {};
      
      expenses.forEach((expense) => {
        if (expense.category_id) {
          categoryTotals[expense.category_id] = (categoryTotals[expense.category_id] || 0) + expense.amount;
        }
      });
      
      setCategoryExpenses(categoryTotals);
    } catch (error) {
      console.error('Error fetching category expenses:', error);
    }
  };

  const handleSubmit = () => {
    const amountNum = parseFloat(amountInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    // Check category limit
    if (selectedCategory.limit !== null) {
      const currentTotal = categoryExpenses[selectedCategory.id] || 0;
      const newTotal = currentTotal + amountNum;
      
      if (newTotal > selectedCategory.limit) {
        Alert.alert(
          'Category Limit Warning',
          `Adding this expense will exceed your ${selectedCategory.name} category limit of ₹${selectedCategory.limit}. Current total: ₹${currentTotal}, New total: ₹${newTotal}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Proceed Anyway', 
              onPress: () => onAddTransaction(amountNum, description.trim(), selectedCategory.id)
            }
          ]
        );
        return;
      }
    }

    onAddTransaction(amountNum, description.trim(), selectedCategory.id);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const newCategory = await addCategory({
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        color: '#000000', // Default color, can be customized later
        is_default: false,
        user_id: session?.user?.id || '',
      });
      setCategories([...categories, newCategory]);
      setSelectedCategory(newCategory);
      setIsCreatingCategory(false);
      setNewCategoryName('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create category');
    }
  };

  const handleSetLimit = (category: Category) => {
    setSelectedCategoryForLimit(category);
    setShowLimitModal(true);
  };

  const handleLimitUpdate = () => {
    fetchCategories();
    fetchCategoryExpenses();
  };

  return (
    <View className="p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold">Add Expense</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View className="mb-4">
        <Text className="mb-1 text-gray-500">Amount</Text>
        <View className="flex-row items-center rounded-lg border border-gray-300 p-3">
          <Text className="mr-2 text-gray-500">₹</Text>
          <TextInput
            className="flex-1 text-lg"
            placeholder="0.00"
            value={amountInput}
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
              setAmountInput(numericValue);
            }}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Description Input */}
      <View className="mb-4">
        <Text className="mb-1 text-gray-500">Description</Text>
        <TextInput
          className="rounded-lg border border-gray-300 p-3"
          placeholder="What did you spend on?"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Categories Section */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-500">Category</Text>
          <TouchableOpacity
            onPress={() => setIsCreatingCategory(!isCreatingCategory)}
            className="flex-row items-center"
          >
            <Ionicons
              name={isCreatingCategory ? 'close' : 'add'}
              size={20}
              color="#3B82F6"
            />
            <Text className="text-blue-500 ml-1">
              {isCreatingCategory ? 'Cancel' : 'New Category'}
            </Text>
          </TouchableOpacity>
        </View>

        {isCreatingCategory ? (
          <View className="mb-2 rounded-lg border border-gray-300 p-3">
            <TextInput
              className="mb-2 border-b border-gray-200 pb-2"
              placeholder="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setNewCategoryIcon('folder')}
                className={`rounded-full p-2 ${
                  newCategoryIcon === 'folder' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                <Ionicons
                  name="folder"
                  size={24}
                  color={newCategoryIcon === 'folder' ? '#3B82F6' : '#666'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewCategoryIcon('cart')}
                className={`rounded-full p-2 ${
                  newCategoryIcon === 'cart' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                <Ionicons
                  name="cart"
                  size={24}
                  color={newCategoryIcon === 'cart' ? '#3B82F6' : '#666'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewCategoryIcon('restaurant')}
                className={`rounded-full p-2 ${
                  newCategoryIcon === 'restaurant' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                <Ionicons
                  name="restaurant"
                  size={24}
                  color={newCategoryIcon === 'restaurant' ? '#3B82F6' : '#666'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewCategoryIcon('car')}
                className={`rounded-full p-2 ${
                  newCategoryIcon === 'car' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                <Ionicons
                  name="car"
                  size={24}
                  color={newCategoryIcon === 'car' ? '#3B82F6' : '#666'}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleCreateCategory}
              className="mt-2 rounded-lg bg-blue-500 p-3">
              <Text className="text-center font-medium text-white">Create Category</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row space-x-2"
          >
            {categories.map((category) => (
              <View key={category.id} className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setSelectedCategory(category)}
                  className={`flex-row items-center px-3 py-2 rounded-full ${
                    selectedCategory?.id === category.id
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={selectedCategory?.id === category.id ? '#3B82F6' : '#666'}
                  />
                  <Text
                    className={`ml-2 ${
                      selectedCategory?.id === category.id
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSetLimit(category)}
                  className="ml-2 p-2"
                >
                  <Ionicons name="settings-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity onPress={handleSubmit} className="rounded-lg bg-red-600 p-4">
        <Text className="text-center font-medium text-white">Add Expense</Text>
      </TouchableOpacity>

      {showLimitModal && selectedCategoryForLimit && (
        <CategoryLimitModal
          category={selectedCategoryForLimit}
          onClose={() => {
            setShowLimitModal(false);
            setSelectedCategoryForLimit(null);
          }}
          onUpdate={handleLimitUpdate}
        />
      )}
    </View>
  );
}
