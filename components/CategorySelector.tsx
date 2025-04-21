import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import EmojiSelector from 'react-native-emoji-selector';
import { getCategories, addCategory } from '../services/database';
import { Category } from '../types/database';
import { Session } from '@supabase/supabase-js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
interface CategorySelectorProps {
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
  session: Session | null;
}

export interface CategorySelectorRef {
  present: () => void;
  dismiss: () => void;
}

const CategorySelector = forwardRef<CategorySelectorRef, CategorySelectorProps>(
  ({ onClose, onSelectCategory, session }, ref) => {
    const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryLimit, setNewCategoryLimit] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('📁');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const { bottom } = useSafeAreaInsets();

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetModalRef.current?.present(),
      dismiss: () => bottomSheetModalRef.current?.dismiss(),
    }));

    useEffect(() => {
      fetchCategories();
    }, []);

    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const handleCategorySelect = (category: Category) => {
      onSelectCategory(category);
      bottomSheetModalRef.current?.dismiss();
      onClose();
    };

    const handleLimitChange = (text: string) => {
      // Remove any non-numeric characters except decimal point
      const numericValue = text.replace(/[^0-9.]/g, '');
      
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      if (parts.length > 2) return;
      
      // Limit to 2 decimal places
      if (parts[1] && parts[1].length > 2) return;
      
      setNewCategoryLimit(numericValue);
    };

    const handleCreateCategory = async () => {
      if (!newCategoryName.trim()) {
        Alert.alert('Error', 'Please enter a category name');
        return;
      }

      try {
        const newCategory = await addCategory({
          name: newCategoryName.trim(),
          icon: selectedEmoji,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random hex color
          is_default: false,
          user_id: session?.user?.id || '',
          limit: newCategoryLimit ? parseFloat(newCategoryLimit) : null,
        });

        // Update categories list
        setCategories([...categories, newCategory]);
        
        // Reset form
        setNewCategoryName('');
        setNewCategoryLimit('');
        setSelectedEmoji('📁');
        
        // Close create form and select the new category
        setIsCreating(false);
        onSelectCategory(newCategory);
        bottomSheetModalRef.current?.dismiss();
        onClose();
      } catch (error) {
        Alert.alert('Error', 'Failed to create category');
        console.error('Error creating category:', error);
      }
    };

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      []
    );

    const renderCreateCategoryForm = () => (
      <View className="">
        <View className="px-4 pt-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-gray-900">Create Category</Text>
            <TouchableOpacity onPress={() => setIsCreating(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {showEmojiPicker ? (
          <View className="">
            <EmojiSelector
              onEmojiSelected={(emoji) => {
                setSelectedEmoji(emoji);
                setShowEmojiPicker(false);
              }}
              showSearchBar
              showTabs={false}
              columns={8}
            />
          </View>
        ) : (
          <ScrollView className="px-4">
            <View className="flex-col gap-4">
              <View>
                <Text className="mb-2 text-sm text-gray-600">Category Icon</Text>
                <TouchableOpacity 
                  className="flex-row items-center rounded-lg border border-gray-200 p-3"
                  onPress={() => setShowEmojiPicker(true)}>
                  <Text className="text-2xl mr-3">{selectedEmoji}</Text>
                  <Text className="text-gray-600">Select Emoji</Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text className="mb-2 text-sm text-gray-600">Category Name</Text>
                <TextInput
                  className="rounded-lg border border-gray-200 p-3"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
              </View>

              <View>
                <Text className="mb-2 text-sm text-gray-600">Monthly Limit (Optional)</Text>
                <TextInput
                  className="rounded-lg border border-gray-200 p-3"
                  placeholder="Enter limit amount"
                  keyboardType="numeric"
                  value={newCategoryLimit}
                  onChangeText={handleLimitChange}
                />
              </View>

              <TouchableOpacity 
                className="mt-4 rounded-xl bg-blue-500 p-4"
                onPress={handleCreateCategory}>
                <Text className="text-center text-lg font-medium text-white">Create Category</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    );

    const renderCategoryList = () => (
      <>
        <View className="px-4 pt-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-gray-900">Add Category</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="px-4">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategorySelect(category)}
              className="flex-row items-center justify-between border-b border-gray-200 py-4">
              <View className="flex-row items-center">
                <Text className="text-2xl">{category.icon}</Text>
                <Text className="ml-3 text-lg text-gray-700">{category.name}</Text>
              </View>
              {category.limit && <Text className="text-gray-500">₹{category.limit}</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="px-4 pt-4">
          <TouchableOpacity 
            className="mb-4 flex-row items-center justify-center rounded-xl bg-blue-500 p-4"
            onPress={() => setIsCreating(true)}>
            <Ionicons name="add" size={24} color="white" />
            <Text className="ml-2 text-lg font-medium text-white">Create Category</Text>
          </TouchableOpacity>
        </View>
      </>
    );

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={['75%']}
        enableHandlePanningGesture={false}
        enablePanDownToClose={false}
        enableContentPanningGesture={false}
        onDismiss={onClose}
        backdropComponent={renderBackdrop}>
        <BottomSheetView style={{ paddingBottom: bottom }}>
          {isCreating ? renderCreateCategoryForm() : renderCategoryList()}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default CategorySelector;
