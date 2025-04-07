import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { Text } from 'react-native';

import { RootStackParamList } from '.';
import ExpenseScreen from '../screens/ExpenseScreen';
const Tab = createBottomTabNavigator();

type Props = StackScreenProps<RootStackParamList, 'TabNavigator'>;

export default function TabLayout({ navigation }: Props) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}>
      <Tab.Screen
        name="Expense"
        component={ExpenseScreen}
        options={{
          title: '',
          tabBarIcon: () => (
            <Text style={{ fontSize: 24 }}>₹</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
