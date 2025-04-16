import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getExpenses } from '../services/database';
import { Expense } from '../types/database';
import PieChart from 'react-native-pie-chart';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type Slice = {
  value: number;
  color: string;
  label?: {
    text: string;
  };
};

export default function ReportsScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<Slice[]>([]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses(selectedMonth);
      setExpenses(data);

      // Process data for pie chart
      const categoryMap = new Map<string, { total: number; color: string }>();

      data.forEach((expense) => {
        if (expense.category) {
          const current = categoryMap.get(expense.category.name) || {
            total: 0,
            color: expense.category.color,
          };
          categoryMap.set(expense.category.name, {
            total: current.total + expense.amount,
            color: expense.category.color,
          });
        }
      });

      const chartData = Array.from(categoryMap.entries()).map(([name, { total, color }]) => ({
        value: total,
        color: color,
        label: {
          text: name,
        },
      }));

      setCategoryData(chartData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth]);

  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const widthAndHeight = Dimensions.get('window').width * 0.8;

  return (
    <SafeAreaView className=" bg-white">
      {/* Month Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ paddingRight: 16 }}>
        {months.map((month, index) => (
          <TouchableOpacity
            key={month}
            onPress={() => setSelectedMonth(index)}
            className={`mr-3 rounded-full border border-gray-300 px-4 py-2 ${
              selectedMonth === index ? 'bg-blue-500' : 'bg-gray-100'
            }`}>
            <Text
              className={`text-sm font-medium ${
                selectedMonth === index ? 'text-white' : 'text-gray-600'
              }`}>
              {month}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="h-[93.5%]">
        {/* Total Expense for Month */}
        <View className="p-4">
          <Text className="text-gray-500">Total Expenses for {months[selectedMonth]}</Text>
          <Text className="text-3xl font-bold text-gray-900">₹{totalExpense.toLocaleString()}</Text>
        </View>

        {/* Pie Chart */}
        {!loading && categoryData.length > 0 && (
          <View className="items-center justify-center py-4">
            <PieChart
              widthAndHeight={widthAndHeight}
              series={categoryData}
              cover={{ radius: 0.45, color: '#FFF' }}
            />
            {/* Category Legend */}
            <View className="mt-4 flex-row flex-wrap justify-center px-4">
              {categoryData.map((item, index) => (
                <View key={index} className="mb-2 mr-4 flex-row items-center">
                  <View
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-sm text-gray-600">
                    {item.label?.text} (₹{item.value.toLocaleString()})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Expenses List */}
        <ScrollView className="h-[35%]">
          {loading ? (
            <View className=" items-center justify-center p-8">
              <Text className="text-gray-400">Loading...</Text>
            </View>
          ) : expenses.length === 0 ? (
            <View className=" items-center justify-center p-8">
              <Text className="text-gray-400">No expenses for {months[selectedMonth]}</Text>
            </View>
          ) : (
            expenses.map((expense) => (
              <View
                key={expense.id}
                className="flex-row items-center justify-between border-b border-gray-100 p-4">
                <View className=" flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Ionicons
                      name={expense.category?.icon || 'folder'}
                      size={20}
                      color={expense.category?.color || '#666'}
                    />
                  </View>
                  <View className="">
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
                <Text className="text-lg font-semibold text-red-600">
                  -₹{expense.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
