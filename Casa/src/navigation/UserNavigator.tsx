import React from 'react';
import { AIAgent } from '../components/AIAgent';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { UserStackParamList, UserTabParamList } from './types';
import HomeScreen from '../screens/user/HomeScreen';
import CatalogScreen from '../screens/user/CatalogScreen';
import CartScreen from '../screens/user/CartScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import ProductDetailsScreen from '../screens/user/ProductDetailsScreen';
import ImagePlacementScreen from '../screens/user/ImagePlacementScreen';
import CheckoutScreen from '../screens/user/CheckoutScreen';
import OrderHistoryScreen from '../screens/user/OrderHistoryScreen';
import { COLORS, THEME } from '../constants/theme';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator<UserTabParamList>();
const Stack = createNativeStackNavigator<UserStackParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'cube';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CatalogTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: THEME.typography.fontFamily.medium,
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerShadowVisible: false,
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontFamily: THEME.typography.fontFamily.bold,
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Casa' }}
      />
      <Tab.Screen
        name="CatalogTab"
        component={CatalogScreen}
        options={{ title: 'Collection' }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export const UserNavigator = () => {
  return (
    <>
      <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerShadowVisible: false,
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontFamily: THEME.typography.fontFamily.bold,
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="ImagePlacement"
        component={ImagePlacementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ title: 'My Orders' }}
      />
      </Stack.Navigator>
      <AIAgent />
    </>
  );
};

export default UserNavigator;
