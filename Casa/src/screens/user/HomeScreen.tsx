import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { UserStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import supabase from '../../lib/supabase';
import { Furniture } from '../../types/database';
import { furnitureService } from '../../services/furnitureService';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - THEME.spacing.lg * 2 - THEME.spacing.md) / 2;

export const MOCK_FURNITURE: Furniture[] = [
  {
    id: 'mock-f1',
    name: 'Puff White Cloud Chair',
    price: 1350.00,
    description: 'Sculptural cloud-shaped lounge chair upholstered in shaggy cream bouclé fabric, adding warmth to any room.',
    category: 'Living',
    image_url: require('../../../assets/products/85f2ba03624c8d3f811141c87eed6538.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f2',
    name: 'Textured Moss Chair',
    price: 980.00,
    description: 'A striking structural chair wrapped in a vibrant green textured wool, combining bold color with minimalist geometry.',
    category: 'Living',
    image_url: require('../../../assets/products/67202ac769328362ea07f5254394abd6.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f3',
    name: 'Walnut Tubular Seat',
    price: 1240.00,
    description: 'Mid-century modernist design featuring dark walnut legs supporting a deeply tufted beige cushion structure.',
    category: 'Dining',
    image_url: require('../../../assets/products/74c56af2dc4f3baf6b6dcb0386947e02.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f4',
    name: 'Cream Bouclé Lounge',
    price: 1150.00,
    description: 'An elegant oversized lounge chair featuring soft cream bouclé upholstery with solid wooden ball feet.',
    category: 'Living',
    image_url: require('../../../assets/products/c772a6d5fe6551f204ac551e0236c558.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f5',
    name: 'Tubular Tan Occasional',
    price: 890.00,
    description: 'A minimalist piece showcasing an unbroken curved silhouette wrapped in light beige performance fabric.',
    category: 'Bedroom',
    image_url: require('../../../assets/products/51947bb94a8a142e9fb94bcfd77af0bb.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f6',
    name: 'Plush White Swivel',
    price: 1050.00,
    description: 'A contemporary swivel chair featuring an overlapping folded design wrapped in luxurious faux fur.',
    category: 'Workspace',
    image_url: require('../../../assets/products/02faba319ab11573551f5eaa564e9cd8.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f7',
    name: 'Layered Caramel Chair',
    price: 1650.00,
    description: 'A masterpiece of texture featuring three layers of curled caramel bouclé on a solid ribbed walnut pedestal.',
    category: 'Living',
    image_url: require('../../../assets/products/2d0d50aa07e40f6889e59b1692504e31.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f8',
    name: 'Curved Crimson Chair',
    price: 1450.00,
    description: 'A striking statement piece wrapped in deep crimson velvet, featuring a bold wrap-around tubular structure.',
    category: 'Living',
    image_url: require('../../../assets/products/66cf7331dcc50f6808d16ea12cea6ef7.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f9',
    name: 'Ivory Cloud Recliner',
    price: 1800.00,
    description: 'Extremely plush lounging chair offering maximum comfort in soft ivory fabric with bold oversized arms.',
    category: 'Bedroom',
    image_url: require('../../../assets/products/c97e84f9b42b7520d66c2ff8c071a86b.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f10',
    name: 'Sculptural White Bouclé',
    price: 1250.00,
    description: 'Beautiful asymmetrical white chair combining organic curves with textured fabric for a premium minimalist aesthetic.',
    category: 'Living',
    image_url: require('../../../assets/products/456c3b4092a99d92283fe944bccfe677.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f11',
    name: 'Origami Accent Chair',
    price: 980.00,
    description: 'A unique folded-style accent chair resting on arched mahogany panels. Perfect blend of Japanese and Mid-Century design.',
    category: 'Workspace',
    image_url: require('../../../assets/products/9e6147d1000275d200a3339f44f360a2.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f12',
    name: 'Slouchy Taupe Lounger',
    price: 1550.00,
    description: 'Deep taupe relaxation chair offering an oversized slouchy silhouette, perfect for cozying up with a book.',
    category: 'Living',
    image_url: require('../../../assets/products/501bacc95349b8f8d6ee3fe01a9b6fa4.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f13',
    name: 'Rounded Ivory Swivel',
    price: 1100.00,
    description: 'Classic tub-style swivel chair in an elegant ivory upholstery, bringing subtle softness to formal living rooms.',
    category: 'Dining',
    image_url: require('../../../assets/products/6b9eef04bfa8c93c70bcc92ff798ecd4.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f14',
    name: 'Sage Wrap Chair',
    price: 1220.00,
    description: 'Beautiful soft sage green chair featuring a single continuous fabric wrap that acts as arms and backrest.',
    category: 'Living',
    image_url: require('../../../assets/products/7b955eee4260c4ded3ee2b4a11e06188.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f15',
    name: 'Low Profile Dune',
    price: 1350.00,
    description: 'A sprawling low-profile lounge chair in textured dune sand color, perfect for relaxed casual seating areas.',
    category: 'Bedroom',
    image_url: require('../../../assets/products/8fa89be745e07fe3446c43dfe9a67feb.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f16',
    name: 'Wicker Mushroom Chair',
    price: 1180.00,
    description: 'A stunning dome-shaped wicker chair with a wide flared back and a plush white cushion, resting on a solid rattan pedestal base.',
    category: 'Outdoor',
    image_url: require('../../../assets/products/f395f018217577ec0fa38eb0c2ff61b5.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f17',
    name: 'Rattan Wave Rocker',
    price: 1380.00,
    description: 'A sculptural rattan rocking chair with a sweeping S-curve silhouette. Handwoven from natural cane with a matte finish.',
    category: 'Outdoor',
    image_url: require('../../../assets/products/f4a3a03a0dcea9be3e6d2cc94a95e9af.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f18',
    name: 'Cocoon Wicker Pod',
    price: 920.00,
    description: 'An organic egg-shaped wicker pod chair. Entirely handwoven from natural cane into a seamless spherical form.',
    category: 'Outdoor',
    image_url: require('../../../assets/products/e88fb10b5bf07c2eaee02687d5a053d6.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f19',
    name: 'Boho Rattan Lounger',
    price: 1450.00,
    description: 'A dramatic open-form rattan lounger with a bold cut-through arch design. Inspired by Wabi-Sabi Japanese aesthetics.',
    category: 'Outdoor',
    image_url: require('../../../assets/products/35b6066ac4fcfe22ab36b158667fbed8.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-f20',
    name: 'Rattan Curl Lounge',
    price: 1290.00,
    description: 'A smooth, minimalist rattan lounge chair formed from a single continuous curl of woven cane — effortlessly elegant.',
    category: 'Outdoor',
    image_url: require('../../../assets/products/22e5bb810dd295d3453f387cfe555326.jpg') as any,
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
];

const CATEGORIES = ['All', 'Living', 'Dining', 'Bedroom', 'Workspace', 'Outdoor'];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { isMockMode } = useAuthStore();
  const { addItem } = useCartStore();
  
  const [products, setProducts] = useState<Furniture[]>(MOCK_FURNITURE);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['mock-f1']);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await furnitureService.fetchFurniture(false);
      
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(MOCK_FURNITURE);
      }
    } catch (err) {
      console.warn('Network issue fetching products, using mock:', err);
      setProducts(MOCK_FURNITURE);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProductItem = ({ item }: { item: Furniture }) => {
    const isFav = favorites.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.productCard}
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
          
          {/* Favorite heart icon */}
          <TouchableOpacity
            style={styles.favoriteBadge}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={16}
              color={isFav ? '#E05C2A' : COLORS.textSecondary}
            />
          </TouchableOpacity>
          {/* Category badge chip */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
            
            {/* Round action button at bottom-right of card */}
            <TouchableOpacity
              style={styles.cardActionBtn}
              onPress={() => {
                addItem(item);
                // Mini feedback trigger
                Alert.alert('Added', `${item.name} added to cart!`);
              }}
            >
              <Ionicons name="bag-add" size={14} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Bring Home the{'\n'}Perfect <Text style={styles.headerTitleHighlight}>Furniture!</Text>
            </Text>
            <TouchableOpacity style={styles.bellButton} onPress={() => {}}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          {/* Search bar with filter icon */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
              <TextInput
                placeholder="Search..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('CatalogTab' as any)}>
              <Ionicons name="options-outline" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          </View>

          {/* Promo Offer Banner */}
          <View style={styles.promoBanner}>
            {/* Decorative background circles */}
            <View style={styles.promoDecorCircleLarge} />
            <View style={styles.promoDecorCircleSmall} />

            <View style={styles.promoTextContainer}>
              <Text style={styles.promoSubtitle}>EXCLUSIVE ——</Text>
              <Text style={styles.promoTitle}>New{' '}Arrivals{`\n`}Deal</Text>

              <View style={styles.promoBadge}>
                <Ionicons name="pricetag" size={10} color={COLORS.primary} style={styles.promoBadgeIcon} />
                <Text style={styles.promoBadgeText}>Special Offers</Text>
              </View>
              <Text style={styles.promoPercent}>UP TO 40% OFF</Text>
            </View>

            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400' }}
              style={styles.promoImage}
            />

            <TouchableOpacity style={styles.promoArrowBtn}>
              <Ionicons name="arrow-forward" size={14} color={COLORS.surface} />
            </TouchableOpacity>
          </View>

          {/* Category Filter Horizontal Scroll */}
          <View style={styles.categoriesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category && styles.activeCategoryTab,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      selectedCategory === category && styles.activeCategoryTabText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Section Heading */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Selling Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CatalogTab' as any)}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Products List Grid */}
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No furniture items match filters.</Text>
            </View>
          ) : (
            <View style={styles.gridWrapContainer}>
              {filteredProducts.map((item) => (
                <View key={item.id} style={styles.gridItemWrapper}>
                  {renderProductItem({ item })}
                </View>
              ))}
            </View>
          )}
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
  scrollContent: {
    paddingBottom: THEME.spacing.xl,
  },
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '900',
    color: COLORS.primary,
    lineHeight: 30,
  },
  headerTitleHighlight: {
    color: COLORS.accent,
    fontWeight: '900',
  },
  bellButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E05C2A',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: THEME.spacing.md,
    height: 48,
    marginRight: THEME.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: THEME.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.primary,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  promoBanner: {
    height: 170,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    padding: THEME.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: THEME.spacing.lg,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  promoDecorCircleLarge: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -70,
    right: 50,
  },
  promoDecorCircleSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -30,
    left: 70,
  },
  promoTextContainer: {
    flex: 1.2,
    justifyContent: 'center',
    zIndex: 2,
  },
  promoSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    fontFamily: THEME.typography.fontFamily.bold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  promoTitle: {
    color: COLORS.surface,
    fontSize: 20,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: THEME.spacing.sm,
    lineHeight: 26,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  promoBadgeIcon: {
    marginRight: 4,
  },
  promoBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontFamily: THEME.typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  promoPercent: {
    color: COLORS.accent,
    fontSize: 13,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '800',
    marginTop: 6,
  },
  promoImage: {
    flex: 1,
    height: '120%',
    resizeMode: 'cover',
    borderRadius: 18,
    marginTop: -12,
  },
  promoArrowBtn: {
    position: 'absolute',
    bottom: THEME.spacing.md,
    right: THEME.spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  categoriesContainer: {
    marginBottom: THEME.spacing.lg,
  },
  categoriesScroll: {
    paddingVertical: 4,
  },
  categoryTab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginRight: THEME.spacing.sm,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  activeCategoryTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  categoryTabText: {
    fontSize: 12,
    fontFamily: THEME.typography.fontFamily.medium,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeCategoryTabText: {
    color: COLORS.surface,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: THEME.typography.fontFamily.medium,
    color: COLORS.accent,
    fontWeight: '700',
  },
  loaderContainer: {
    paddingVertical: THEME.spacing.xl,
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: THEME.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: THEME.typography.fontSize.xs,
  },
  gridWrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: THEME.spacing.md,
  },
  gridItemWrapper: {
    width: COLUMN_WIDTH,
    marginBottom: THEME.spacing.md + 4,
  },
  productCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0D3D26',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 7,
  },
  imageContainer: {
    width: '100%',
    height: COLUMN_WIDTH + 20,
    backgroundColor: COLORS.surfaceVariant,
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  productInfo: {
    padding: 12,
    paddingTop: 10,
  },
  productName: {
    fontSize: 12,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.2,
    marginBottom: 7,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default HomeScreen;
