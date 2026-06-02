import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from './types';
import DashboardScreen from '../screens/admin/DashboardScreen';
import ManageProductsScreen from '../screens/admin/ManageProductsScreen';
import ManageOrdersScreen from '../screens/admin/ManageOrdersScreen';
import EditProductScreen from '../screens/admin/EditProductScreen';
import AuditLogsScreen from '../screens/admin/AuditLogsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import { COLORS, THEME } from '../constants/theme';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminNavigator = () => {
  return (
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
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen
        name="ManageProducts"
        component={ManageProductsScreen}
        options={{ title: 'Products' }}
      />
      <Stack.Screen
        name="ManageOrders"
        component={ManageOrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={({ route }) => ({
          title: route.params?.productId ? 'Edit Product' : 'Add Product',
        })}
      />
      <Stack.Screen
        name="AuditLogs"
        component={AuditLogsScreen}
        options={{ title: 'Audit Logs' }}
      />
      <Stack.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{ title: 'Admin Profile' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
