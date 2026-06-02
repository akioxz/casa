import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';
import useCartStore, { CartItem } from '../../store/cartStore';
import Button from '../../components/Button';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigation.navigate('Checkout');
  };

  const confirmRemoveItem = (item: CartItem) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove ${item.product.name} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(item.product.id) },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image
        source={
          typeof item.product.image_url === 'string'
            ? (item.product.image_url.startsWith('http')
                ? { uri: item.product.image_url }
                : { uri: 'data:image/png;base64,' + item.product.image_url })
            : item.product.image_url
        }
        style={styles.productImage}
      />
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.product.name}
          </Text>
          <TouchableOpacity onPress={() => confirmRemoveItem(item)} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
        <Text style={styles.productCategory}>{item.product.category}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.productPrice}>{formatCurrency(item.product.price)}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
            >
              <Ionicons name="remove-outline" size={14} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
            >
              <Ionicons name="add-outline" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cart-outline" size={60} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven't added any luxury furniture to your cart yet.
            </Text>
            <Button
              title="Browse Furniture"
              onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
              style={styles.browseBtn}
            />
          </View>
        ) : (
          <>
            {/* List of Cart Items */}
            <FlatList
              data={items}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.product.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />

            {/* Price Summary Footer */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(getTotalPrice())}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.deliveryFree}>Free</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(getTotalPrice())}</Text>
              </View>

              <Button
                title="Proceed to Checkout"
                onPress={handleCheckout}
                style={styles.checkoutBtn}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  clearText: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.medium,
    color: COLORS.error,
  },
  listContainer: {
    padding: THEME.spacing.lg,
    paddingBottom: 50,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: '#F5F5F7',
    resizeMode: 'cover',
  },
  cardInfo: {
    flex: 1,
    marginLeft: THEME.spacing.md,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: THEME.typography.fontSize.sm - 1,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    color: COLORS.primary,
    maxWidth: '85%',
  },
  removeButton: {
    padding: 2,
  },
  productCategory: {
    fontSize: THEME.typography.fontSize.xs - 2,
    fontFamily: THEME.typography.fontFamily.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: '#F5F5F7',
  },
  quantityBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    paddingHorizontal: 8,
    fontSize: THEME.typography.fontSize.xs - 1,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl * 1.5,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  emptyTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
    marginBottom: THEME.spacing.sm,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: THEME.spacing.lg,
  },
  browseBtn: {
    width: '100%',
  },
  summaryContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    padding: THEME.spacing.lg,
    ...THEME.shadows.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  summaryLabel: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
  },
  deliveryFree: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    color: '#2E7D32', // Elegantly colored green for Free Delivery
  },
  totalRow: {
    marginTop: THEME.spacing.xs,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: THEME.spacing.sm,
  },
  totalLabel: {
    fontSize: THEME.typography.fontSize.sm,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: THEME.typography.fontSize.sm,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.secondary,
  },
  checkoutBtn: {
    marginTop: THEME.spacing.md,
  },
});

export default CartScreen;
