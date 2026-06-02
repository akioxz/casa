import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { UserStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import supabase from '../../lib/supabase';
import { Furniture } from '../../types/database';
import { furnitureService } from '../../services/furnitureService';
import { MOCK_FURNITURE } from './HomeScreen';

type ProductDetailsScreenProps = NativeStackScreenProps<UserStackParamList, 'ProductDetails'>;

const { width, height } = Dimensions.get('window');
const getBaseColorForProduct = (productId: string) => {
  const map: Record<string, string> = {
    'mock-f1': '#EAE6DF',
    'mock-f2': '#5E6B56',
    'mock-f3': '#3D2F24',
    'mock-f4': '#EBE6DF',
    'mock-f5': '#800020', // Fixing mismatch: this image is actually the red couch!
    'mock-f6': '#F2F2F2',
    'mock-f7': '#A66E40',
    'mock-f8': '#C8B59B', // Swapping with f5 just in case f8 is the tan one
    'mock-f9': '#F5F5F0',
    'mock-f10': '#FFFFFF',
    'mock-f11': '#8A6F5C',
    'mock-f12': '#9E948C',
    'mock-f13': '#FAF8F5',
    'mock-f14': '#879782',
    'mock-f15': '#C2B198',
  };
  return map[productId] || '#EAE6DF';
};

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({ route, navigation }) => {
  const { productId } = route.params;
  const { isMockMode } = useAuthStore();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Furniture | null>(null);
  const [selectedColor, setSelectedColor] = useState('c1');
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useFocusEffect(
    useCallback(() => {
      fetchProductDetails();
    }, [productId])
  );

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      const data = await furnitureService.fetchProductById(productId);
      
      if (data) {
        setProduct(data);
      } else {
        const mockItem = MOCK_FURNITURE.find((item) => item.id === productId);
        setProduct(mockItem || MOCK_FURNITURE[0]);
      }
    } catch (err) {
      console.warn('Error fetching item details:', err);
      const mockItem = MOCK_FURNITURE.find((item) => item.id === productId);
      setProduct(mockItem || MOCK_FURNITURE[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    // Add multiple quantities to cart
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    Alert.alert(
      'Added to Cart',
      `${quantity}x ${product.name} added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('MainTabs', { screen: 'CartTab' }) },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Item details could not be found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Back to Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Deck */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.roundHeaderBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roundHeaderBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
        >
          <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Floating details / large photo view */}
        <View style={styles.photoContainer}>
          {/* Vertical float color variation bubble deck on the left */}
          <View style={styles.verticalColorDeck}>
            {(() => {
              const productBaseColor = product?.base_color || getBaseColorForProduct(product?.id || '');
              const dynamicColors = [
                { id: 'c1', value: productBaseColor, name: 'Original' },
                { id: 'c2', value: '#B2A398', name: 'Taupe' },
                { id: 'c3', value: '#796B8A', name: 'Lilac' },
                { id: 'c4', value: '#6E9BB2', name: 'Sage Blue' },
              ];
              
              return dynamicColors.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorBubbleOuter,
                    selectedColor === color.id && styles.activeColorBubbleOuter,
                  ]}
                  onPress={() => setSelectedColor(color.id)}
                >
                  <View style={[styles.colorBubbleInner, { backgroundColor: color.value }]} />
                </TouchableOpacity>
              ));
            })()}
          </View>

          <View style={styles.imageWrapper}>
            <Image
              source={
                typeof product.image_url === 'string'
                  ? (product.image_url.startsWith('http')
                      ? { uri: product.image_url }
                      : { uri: 'data:image/png;base64,' + product.image_url })
                  : product.image_url
              }
              style={styles.productImage}
            />
            {selectedColor !== 'c1' && (
              <View
                pointerEvents="none"
                style={[
                  styles.productImage,
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: [
                      { id: 'c1', value: product?.base_color || getBaseColorForProduct(product?.id || '') },
                      { id: 'c2', value: '#B2A398' },
                      { id: 'c3', value: '#796B8A' },
                      { id: 'c4', value: '#6E9BB2' },
                    ].find(c => c.id === selectedColor)?.value,
                    mixBlendMode: 'color'
                  } as any
                ]}
              />
            )}
          </View>
        </View>

        {/* Bottom Details Panel Sheet */}
        <View style={styles.detailsSheet}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productSubName}>Luxury Furniture Collection</Text>

          <View style={styles.priceQuantityRow}>
            <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
            
            {/* Quantity Controller deck in dark rounded bubble */}
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Ionicons name="remove" size={16} color={COLORS.surface} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>
                {quantity < 10 ? `0${quantity}` : quantity}
              </Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => q + 1)}
              >
                <Ionicons name="add" size={16} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.descriptionText}>{product.description}</Text>

          {/* Placement assist banner */}
          <TouchableOpacity
            style={styles.arPlacementBanner}
            onPress={() => navigation.navigate('ImagePlacement', { productId: product.id, imageUrl: product.image_url })}
          >
            <Ionicons name="scan-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.arPlacementText}>Launch Virtual Room Placement Tool</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Bottom Styled Action Button */}
          <TouchableOpacity
            style={styles.cartActionButton}
            activeOpacity={0.9}
            onPress={handleAddToCart}
          >
            <Text style={styles.cartActionText}>Add To Cart</Text>
            <View style={styles.cartActionIconWrapper}>
              <Ionicons name="bag" size={18} color={COLORS.surface} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, // Match the tinted background
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: THEME.spacing.md,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
  },
  backBtnText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  roundHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...THEME.shadows.small,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.xl,
  },
  photoContainer: {
    height: height * 0.4,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageWrapper: {
    width: width * 0.75,
    height: '90%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  verticalColorDeck: {
    position: 'absolute',
    left: THEME.spacing.lg + 4,
    top: height * 0.05,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 25,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    zIndex: 2,
    ...THEME.shadows.small,
  },
  colorBubbleOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeColorBubbleOuter: {
    borderColor: COLORS.secondary,
  },
  colorBubbleInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  detailsSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: THEME.spacing.lg + 4,
    paddingTop: THEME.spacing.lg + 4,
    paddingBottom: THEME.spacing.xl * 1.5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: THEME.spacing.md,
    ...THEME.shadows.large,
  },
  productName: {
    fontSize: THEME.typography.fontSize.md + 2,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productSubName: {
    fontSize: THEME.typography.fontSize.xs - 2,
    fontFamily: THEME.typography.fontFamily.medium,
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
  },
  productPrice: {
    fontSize: THEME.typography.fontSize.md + 3,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '800',
    color: COLORS.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...THEME.shadows.small,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  qtyText: {
    color: COLORS.surface,
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    paddingHorizontal: 6,
  },
  descriptionText: {
    fontSize: THEME.typography.fontSize.xs + 1,
    fontFamily: THEME.typography.fontFamily.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: THEME.spacing.lg,
  },
  arPlacementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.lg,
  },
  arPlacementText: {
    flex: 1,
    fontSize: 11,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
    marginLeft: THEME.spacing.sm,
  },
  cartActionButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#B2C0B8', // Tinted premium light-gray matching design inspo
    borderWidth: 1,
    borderColor: '#9EAEA4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: THEME.spacing.xl,
    paddingRight: 6,
    ...THEME.shadows.small,
  },
  cartActionText: {
    color: COLORS.primary,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    fontSize: THEME.typography.fontSize.xs + 1,
  },
  cartActionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductDetailsScreen;
