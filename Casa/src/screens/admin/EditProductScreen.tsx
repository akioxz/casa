import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import { furnitureSchema, FurniturePayload } from '../../utils/validation';
import { furnitureService } from '../../services/furnitureService';
import useAuthStore from '../../store/authStore';
import supabase from '../../lib/supabase';
import Input from '../../components/Input';
import Button from '../../components/Button';

type EditProductScreenProps = NativeStackScreenProps<AdminStackParamList, 'EditProduct'>;

export const EditProductScreen: React.FC<EditProductScreenProps> = ({ route, navigation }) => {
  const { productId } = route.params;
  const isEdit = !!productId;
  const { isMockMode } = useAuthStore();

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FurniturePayload>({
    resolver: zodResolver(furnitureSchema) as any,
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      category: 'Living',
      imageUrl: '',
    }
  });

  const watchImageUrl = watch('imageUrl');
  const watchCategory = watch('category');

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await furnitureService.fetchProductById(productId!);
      if (data) {
        setValue('name', data.name);
        setValue('price', data.price);
        setValue('description', data.description);
        setValue('category', data.category);
        setValue('imageUrl', data.image_url);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setValue('imageUrl', result.assets[0].uri, { shouldValidate: true });
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    if (isMockMode) return uri; // bypass upload
    if (uri.startsWith('http')) return uri; // already uploaded
    if (uri.startsWith('data:')) return uri; // base64 fallback

    setIsUploading(true);
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpeg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('furniture')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('furniture')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FurniturePayload) => {
    try {
      let finalImageUrl = data.imageUrl;
      // Convert to number if the image is a local statically required image (like those in MOCK_FURNITURE)
      if (typeof finalImageUrl === 'string' && !finalImageUrl.startsWith('http') && !finalImageUrl.startsWith('data:') && !isMockMode) {
        finalImageUrl = await uploadImage(data.imageUrl);
      }

      const payload = {
        name: data.name,
        price: Number(data.price),
        description: data.description,
        category: data.category,
        image_url: finalImageUrl as string,
      };

      if (isEdit) {
        await furnitureService.updateFurniture(productId!, payload);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await furnitureService.createFurniture(payload);
        Alert.alert('Success', 'Product created successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save product');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const categories = ['Living', 'Dining', 'Bedroom', 'Workspace', 'Outdoor'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{isEdit ? 'Edit Product' : 'Create Product'}</Text>
      <Text style={styles.subtitle}>{isEdit ? 'Update inventory item' : 'Add a new product to inventory'}</Text>

      <View style={styles.formCard}>
        {/* Image Picker */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
            {watchImageUrl ? (
              <Image
                source={
                  typeof watchImageUrl === 'number'
                    ? watchImageUrl
                    : { uri: watchImageUrl }
                }
                style={styles.previewImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.imagePlaceholderText}>Tap to select photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.imageUrl && <Text style={styles.errorText}>{errors.imageUrl.message}</Text>}
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Product Name"
              placeholder="e.g. Soriana Ebony Chair"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Price ($)"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={value ? String(value) : ''}
              onChangeText={onChange}
              error={errors.price?.message}
            />
          )}
        />

        <View style={styles.categorySection}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryDeck}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  watchCategory === cat && styles.activeCategoryPill
                ]}
                onPress={() => setValue('category', cat, { shouldValidate: true })}
              >
                <Text style={[
                  styles.categoryPillText,
                  watchCategory === cat && styles.activeCategoryPillText
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
        </View>

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description"
              placeholder="Detailed product description..."
              multiline
              numberOfLines={4}
              value={value}
              onChangeText={onChange}
              error={errors.description?.message}
            />
          )}
        />

        <Button
          title={isEdit ? 'Save Changes' : 'Create Product'}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting || isUploading}
          style={styles.submitBtn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl * 2,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    ...THEME.shadows.medium,
  },
  imageSection: {
    marginBottom: THEME.spacing.lg,
    alignItems: 'center',
  },
  imagePickerBtn: {
    width: '100%',
    height: 200,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: '#F5F5F7',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: THEME.spacing.sm,
    color: COLORS.textMuted,
    fontFamily: THEME.typography.fontFamily.medium,
  },
  errorText: {
    color: COLORS.error,
    fontSize: THEME.typography.fontSize.xs,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  categorySection: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: THEME.typography.fontSize.sm,
    fontFamily: THEME.typography.fontFamily.medium,
    color: COLORS.primary,
    marginBottom: 6,
  },
  categoryDeck: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  activeCategoryPill: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  categoryPillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: THEME.typography.fontFamily.medium,
  },
  activeCategoryPillText: {
    color: COLORS.surface,
    fontFamily: THEME.typography.fontFamily.bold,
  },
  submitBtn: {
    marginTop: THEME.spacing.lg,
  },
});
export default EditProductScreen;