import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, THEME } from '../../constants/theme';
import { profileSchema, ProfilePayload } from '../../utils/validation';
import { authService } from '../../services/authService';
import useAuthStore from '../../store/authStore';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Profile } from '../../types/database';

export const AdminProfileScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfilePayload>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      fullName: '',
      phoneNumber: '',
      address: '',
    },
  });

  useEffect(() => {
    if (user) {
      authService.getUserProfile(user.id).then(({ profile, error }) => {
        if (profile) {
          setProfile(profile);
          setAvatarUrl(profile.avatar_url || '');
          setValue('username', profile.username);
          setValue('fullName', profile.full_name || '');
          setValue('phoneNumber', profile.phone_number || '');
          setValue('address', profile.address || '');
        } else if (error) {
          console.warn('Failed to fetch profile:', error);
        }
      });
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is required to change your photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: ProfilePayload) => {
    if (profile && data.username !== profile.username) {
      Alert.alert('Action Denied', 'Administrators cannot change their username for audit integrity.');
      return;
    }

    if (!user) return;

    try {
      setIsUpdating(true);
      await authService.updateUserProfile(user.id, {
        username: data.username,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        address: data.address,
        avatar_url: avatarUrl,
      });
      Alert.alert('Success', 'Admin profile updated successfully');
    } catch (err: any) {
      Alert.alert('Update Failed', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="shield-checkmark" size={40} color={COLORS.surface} />
              </View>
            )}
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={14} color={COLORS.surface} />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.roleText}>Administrator</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Profile Details</Text>

        <View style={styles.warningBox}>
          <Ionicons name="warning" size={16} color={COLORS.error} style={styles.warningIcon} />
          <Text style={styles.warningText}>
            For audit integrity, your username is locked and cannot be modified.
          </Text>
        </View>

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Username (Locked)"
              value={value}
              onChangeText={onChange}
              error={errors.username?.message}
              editable={false}
            />
          )}
        />

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Full Name"
              value={value}
              onChangeText={onChange}
              error={errors.fullName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Phone Number"
              value={value}
              onChangeText={onChange}
              error={errors.phoneNumber?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Address"
              value={value}
              onChangeText={onChange}
              error={errors.address?.message}
            />
          )}
        />

        <Button
          title="Save Changes"
          onPress={handleSubmit(onSubmit)}
          loading={isUpdating}
          style={styles.submitBtn}
        />
      </View>

      <Button
        title="Log Out Session"
        variant="outline"
        onPress={signOut}
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: THEME.spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.small,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  roleText: {
    fontSize: THEME.typography.fontSize.sm,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.medium,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
    marginBottom: THEME.spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.md,
    alignItems: 'center',
  },
  warningIcon: {
    marginRight: THEME.spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.error,
    fontFamily: THEME.typography.fontFamily.medium,
  },
  submitBtn: {
    marginTop: THEME.spacing.md,
  },
  logoutBtn: {
    borderColor: COLORS.error,
  },
});

export default AdminProfileScreen;