import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { UserStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';
import supabase from '../../lib/supabase';
import { Furniture } from '../../types/database';
import { furnitureService } from '../../services/furnitureService';
import { MOCK_FURNITURE } from './HomeScreen';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - THEME.spacing.lg * 2 - THEME.spacing.md) / 2;

export const CatalogScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { isMockMode } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Furniture[]>(MOCK_FURNITURE);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchCatalog();
    }, [])
  );

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const data = await furnitureService.fetchFurniture(false);
      
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(MOCK_FURNITURE);
      }
    } catch (err) {
      console.warn('Network issue fetching catalog:', err);
      setProducts(MOCK_FURNITURE);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCatalogItem = ({ item }: { item: Furniture }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            typeof item.image_url === 'string'
              ? (item.image_url.startsWith('http')
                  ? { uri: item.image_url }
                  : { uri: 'data:image/png;base64,' + item.image_url })
              : item.image_url
          }
          style={styles.productImage}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Bar Container */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search chairs, dining tables, beds..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Exploring catalog...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No matches found for "{searchQuery}"</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderCatalogItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
            refreshing={isLoading}
            onRefresh={fetchCatalog}
          />
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
    paddingHorizontal: THEME.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    height: 48,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.small,
  },
  searchIcon: {
    marginRight: THEME.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: THEME.typography.fontSize.xs + 1,
    fontFamily: THEME.typography.fontFamily.regular,
    color: COLORS.primary,
  },
  clearIcon: {
    padding: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: THEME.spacing.md,
    color: COLORS.textSecondary,
    fontSize: THEME.typography.fontSize.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: THEME.typography.fontSize.xs + 1,
    fontFamily: THEME.typography.fontFamily.medium,
    marginTop: THEME.spacing.md,
    textAlign: 'center',
  },
  gridContainer: {
    paddingBottom: THEME.spacing.xl,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...THEME.shadows.small,
  },
  imageContainer: {
    width: '100%',
    height: COLUMN_WIDTH * 1.1,
    backgroundColor: '#F5F5F7',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: THEME.spacing.xs,
    left: THEME.spacing.xs,
    backgroundColor: 'rgba(26, 26, 26, 0.75)',
    paddingHorizontal: THEME.spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: THEME.typography.fontSize.xs - 3,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.surface,
  },
  productInfo: {
    padding: THEME.spacing.sm,
  },
  productName: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.medium,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
});

export default CatalogScreen;
