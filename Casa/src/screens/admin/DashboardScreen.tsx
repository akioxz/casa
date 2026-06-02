import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import { Furniture } from '../../types/database';
import { furnitureService } from '../../services/furnitureService';
import { formatCurrency } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';

type DashboardScreenProps = NativeStackScreenProps<AdminStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<Furniture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { signOut } = useAuthStore();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Pass true to include soft-deleted items for admins
      const data = await furnitureService.fetchFurniture(true);
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch admin catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleSoftDelete = (item: Furniture) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to hide "${item.name}" from the user catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await furnitureService.deleteFurniture(item.id);
              fetchProducts(); // Refresh list to reflect changes
            } catch (err) {
              Alert.alert('Error', 'Failed to delete item.');
            }
          }
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Furniture }) => {
    const isDeleted = item.is_deleted;
    
    return (
      <View style={[styles.productCard, isDeleted && styles.deletedCard]}>
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
        </View>
        <View style={styles.productInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            {isDeleted ? (
              <View style={[styles.badge, styles.deletedBadge]}>
                <Text style={styles.badgeText}>Hidden</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.activeBadge]}>
                <Text style={styles.badgeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
            >
              <Ionicons name="pencil" size={16} color={COLORS.primary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            
            {!isDeleted && (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleSoftDelete(item)}
              >
                <Ionicons name="trash" size={16} color={COLORS.error} />
                <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('EditProduct', {})}>
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
            <Text style={styles.gridBtnText}>Add Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('AuditLogs')}>
            <Ionicons name="list" size={24} color={COLORS.primary} />
            <Text style={styles.gridBtnText}>Audit Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('AdminProfile')}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
            <Text style={styles.gridBtnText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridBtn} onPress={signOut}>
            <Ionicons name="log-out" size={24} color={COLORS.error} />
            <Text style={[styles.gridBtnText, { color: COLORS.error }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listTitle}>Global Inventory List</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No products found in inventory.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: THEME.typography.fontSize.xl,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
    marginBottom: THEME.spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridBtn: {
    alignItems: 'center',
    flex: 1,
  },
  gridBtnText: {
    fontSize: 10,
    fontFamily: THEME.typography.fontFamily.medium,
    color: COLORS.primary,
    marginTop: 4,
  },
  listHeaderContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
  },
  listTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: THEME.typography.fontFamily.medium,
  },
  listContainer: {
    padding: THEME.spacing.lg,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  deletedCard: {
    opacity: 0.6,
    backgroundColor: '#FAF7F7',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: '#F5F5F7',
    overflow: 'hidden',
    marginRight: THEME.spacing.md,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    flex: 1,
    fontSize: THEME.typography.fontSize.sm,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
    marginRight: THEME.spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  deletedBadge: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: THEME.typography.fontSize.sm,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.secondary,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: THEME.spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    marginRight: THEME.spacing.sm,
  },
  editBtn: {
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  deleteBtn: {
    borderColor: COLORS.error,
    backgroundColor: 'transparent',
  },
  actionText: {
    fontSize: 12,
    fontFamily: THEME.typography.fontFamily.medium,
    color: COLORS.primary,
    marginLeft: 4,
  },
});
export default DashboardScreen;
