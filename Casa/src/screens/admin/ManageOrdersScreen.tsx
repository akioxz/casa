import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import Button from '../../components/Button';

type ManageOrdersScreenProps = NativeStackScreenProps<AdminStackParamList, 'ManageOrders'>;

export const ManageOrdersScreen: React.FC<ManageOrdersScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Orders</Text>
      <Text style={styles.subtitle}>Fulfill orders, track shipping status</Text>
      <View style={styles.card}>
        <Text style={styles.placeholderText}>Global Orders List Placeholder</Text>
        <Button
          title="Back to Dashboard"
          variant="outline"
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: THEME.spacing.lg,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    ...THEME.shadows.medium,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: THEME.spacing.xl,
  },
});
export default ManageOrdersScreen;
