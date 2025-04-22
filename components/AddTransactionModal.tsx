import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategories, addCategory, getExpenses } from '../services/database';
import { Category, Expense } from '../types/database';
import { Session } from '@supabase/supabase-js';
import CategoryLimitModal from './CategoryLimitModal';
import CategorySelector from './CategorySelector';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

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
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const bottomSheetModalRef = React.useRef<any>(null);

  useEffect(() => {
    fetchCategories();
    fetchCategoryExpenses();
  }, []);

  useEffect(() => {
    if (showCategorySelector) {
      bottomSheetModalRef.current?.present();
    }
  }, [showCategorySelector]);

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
              onPress: () => {
                onAddTransaction(amountNum, description.trim(), selectedCategory.id);
                setAmountInput('');
                setDescription('');
                setSelectedCategory(null);
              }
            }
          ]
        );
        return;
      }
    }

    onAddTransaction(amountNum, description.trim(), selectedCategory.id);
    setAmountInput('');
    setDescription('');
    setSelectedCategory(null);
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
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random hex color
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
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Add Expense</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <BottomSheetTextInput
        className="mb-4 rounded-lg border border-gray-200 p-3"
        placeholder="Amount"
        keyboardType="numeric"
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
      />

      <BottomSheetTextInput
        className="mb-4 rounded-lg border border-gray-200 p-3"
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        onPress={() => setShowCategorySelector(true)}
        className="mb-4 flex-row items-center justify-between rounded-lg border border-gray-200 p-3">
        <Text className="text-gray-600">
          {selectedCategory ? selectedCategory.name : 'Select Category'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        className="rounded-lg bg-blue-500 p-3">
        <Text className="text-center text-white">Add Expense</Text>
      </TouchableOpacity>

      {showCategorySelector && (
        <CategorySelector
          ref={bottomSheetModalRef}
          onClose={() => {
            setShowCategorySelector(false);
          }}
          onSelectCategory={(category) => {
            setSelectedCategory(category);
            setShowCategorySelector(false);
          }}
          session={session}
        />
      )}

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
