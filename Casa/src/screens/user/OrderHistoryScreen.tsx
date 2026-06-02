import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, THEME } from '../../constants/theme';
import Button from '../../components/Button';
import { useNavigation } from '@react-navigation/native';

export const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <Text style={styles.subtitle}>Track and view your past purchases</Text>
      <View style={styles.card}>
        <Text style={styles.placeholderText}>Past Orders List Placeholder</Text>
        <Button
          title="Go Back"
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
export default OrderHistoryScreen;
