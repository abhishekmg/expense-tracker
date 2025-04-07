import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../store/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = isSignUp 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (error) {
        Alert.alert('Error', error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-full max-w-sm">
          <Text className="text-3xl font-bold text-center mb-2 text-gray-900">Welcome to</Text>
          <Text className="text-3xl font-bold text-center text-red-600 mb-8">Expense Tracker</Text>
          
          <Text className="text-gray-600 text-center mb-8 text-base">
            Track your expenses easily and efficiently
          </Text>

          {/* Email Input */}
          <View className="mb-4">
            <TextInput
              className={`w-full p-4 border rounded-lg ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <TextInput
              className={`w-full p-4 border rounded-lg ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`w-full bg-red-600 rounded-lg p-4 mb-4 ${
              loading ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white text-center font-medium">
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Toggle Sign Up/Sign In */}
          <TouchableOpacity
            onPress={() => setIsSignUp(!isSignUp)}
            className="mb-4"
          >
            <Text className="text-gray-600 text-center">
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            onPress={signInWithGoogle}
            className="flex-row items-center justify-center bg-white border border-gray-300 rounded-lg p-4 shadow-sm active:bg-gray-50"
          >
            <Ionicons name="logo-google" size={24} color="#DB4437" className="mr-3" />
            <Text className="text-gray-700 font-medium text-base">Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
} 