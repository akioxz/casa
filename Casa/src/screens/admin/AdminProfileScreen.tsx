import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

  const onSubmit = async (data: ProfilePayload) => {
    // Enforcement of read-only username constraint for Admin
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
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="shield-checkmark" size={40} color={COLORS.surface} />
        </View>
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
              editable={false} // UI Enforcement
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
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.small,
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
