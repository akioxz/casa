import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isMockMode } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    loadProfileDetails();
  }, [user]);

  const loadProfileDetails = async () => {
    if (!user) return;
    if (isMockMode) {
      setProfile({
        full_name: 'Johan Doe',
        phone_number: '+15551234567',
        address: '123 Luxury Avenue, Beverly Hills, CA',
      });
      setIsLoadingProfile(false);
      return;
    }

    try {
      const { profile: dbProfile } = await authService.getUserProfile(user.id);
      if (dbProfile) {
        setProfile(dbProfile);
      }
    } catch (err) {
      console.warn('Error loading checkout profile:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setIsPlacingOrder(true);
    // Simulate placing order
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPlacingOrder(false);

    clearCart();
    Alert.alert(
      'Order Placed Successfully!',
      'Thank you for shopping at Casa. Your luxury furniture is on its way.',
      [{ text: 'Return Home', onPress: () => navigation.navigate('MainTabs', { screen: 'HomeTab' }) }]
    );
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Preparing checkout...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Summary */}
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>{profile?.full_name || 'Guest User'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>{profile?.phone_number || 'No phone number provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="map-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>{profile?.address || 'No shipping address provided'}</Text>
          </View>
        </View>

        {/* Order Review List */}
        <Text style={styles.sectionTitle}>Review Items</Text>
        <View style={styles.card}>
          {items.map((item) => (
            <View key={item.product.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name} <Text style={styles.itemQty}>x{item.quantity}</Text>
              </Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Billing Breakdown */}
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.card}>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Subtotal</Text>
            <Text style={styles.billingValue}>{formatCurrency(getTotalPrice())}</Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Shipping</Text>
            <Text style={styles.shippingFree}>Free</Text>
          </View>
          <View style={[styles.billingRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payment</Text>
            <Text style={styles.totalValue}>{formatCurrency(getTotalPrice())}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            title="Confirm & Place Order"
            onPress={handlePlaceOrder}
            loading={isPlacingOrder}
            style={styles.actionButton}
          />
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
            disabled={isPlacingOrder}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    color: COLORS.textSecondary,
    fontSize: THEME.typography.fontSize.xs,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl * 2,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoText: {
    fontSize: THEME.typography.fontSize.xs + 1,
    fontFamily: THEME.typography.fontFamily.regular,
    color: COLORS.textSecondary,
    marginLeft: THEME.spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  itemName: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.medium,
    color: COLORS.primary,
    maxWidth: '75%',
  },
  itemQty: {
    color: COLORS.textSecondary,
    fontFamily: THEME.typography.fontFamily.bold,
  },
  itemPrice: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  billingLabel: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  billingValue: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
  },
  shippingFree: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    color: '#2E7D32',
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: THEME.spacing.sm,
    marginTop: THEME.spacing.xs,
  },
  totalLabel: {
    fontSize: THEME.typography.fontSize.xs + 1,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: THEME.typography.fontSize.xs + 1,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.secondary,
  },
  actionContainer: {
    marginTop: THEME.spacing.lg,
  },
  actionButton: {
    marginBottom: THEME.spacing.sm,
  },
});

export default CheckoutScreen;
