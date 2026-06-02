import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, THEME } from '../../constants/theme';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import { profileSchema, ProfilePayload } from '../../utils/validation';
import Input from '../../components/Input';
import Button from '../../components/Button';

export const ProfileScreen: React.FC = () => {
  const { user, role, signOut, isMockMode } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Self-contained Zod resolver for React Hook Form
  const zodResolver = (data: ProfilePayload) => {
    const result = profileSchema.safeParse(data);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, any> = {};
    result.error.issues.forEach((issue) => {
      const pathKey = String(issue.path[0]);
      errors[pathKey] = {
        type: 'validation',
        message: issue.message,
      };
    });
    return { values: {}, errors };
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfilePayload>({
    resolver: zodResolver as any,
    defaultValues: {
      username: '',
      fullName: '',
      phoneNumber: '',
      address: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    if (isMockMode) {
      // Mock profile state
      const mockProfile = {
        username: user.email?.split('@')[0] || 'johan_doe',
        full_name: 'Johan Doe',
        phone_number: '+15551234567',
        address: '123 Luxury Avenue, Beverly Hills, CA',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        role: role || 'user',
      };
      setProfile(mockProfile);
      reset({
        username: mockProfile.username,
        fullName: mockProfile.full_name,
        phoneNumber: mockProfile.phone_number,
        address: mockProfile.address,
        avatarUrl: mockProfile.avatar_url,
      });
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);
      const { profile: dbProfile, error } = await authService.getUserProfile(user.id);
      if (error) {
        throw new Error(error);
      }
      if (dbProfile) {
        setProfile(dbProfile);
        reset({
          username: dbProfile.username || '',
          fullName: dbProfile.full_name || '',
          phoneNumber: dbProfile.phone_number || '',
          address: dbProfile.address || '',
          avatarUrl: dbProfile.avatar_url || '',
        });
      }
    } catch (err: any) {
      console.warn('Failed to load profile from database:', err.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We require permissions to pick an avatar image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setValue('avatarUrl', selectedUri);
      setProfile((prev: any) => ({ ...prev, avatar_url: selectedUri }));
    }
  };

  const onSubmit = async (data: ProfilePayload) => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (isMockMode) {
        // Mock save logic
        await new Promise((resolve) => setTimeout(resolve, 800));
        setProfile({
          username: data.username,
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          address: data.address,
          avatar_url: data.avatarUrl || profile?.avatar_url,
          role: role || 'user',
        });
        setIsEditing(false);
        Alert.alert('Profile Saved', 'Your mock profile was successfully updated.');
        return;
      }

      // Real database update via authService
      const { error } = await authService.updateUserProfile(user.id, {
        username: data.username,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        address: data.address,
        avatar_url: data.avatarUrl || profile?.avatar_url,
      });

      if (error) {
        Alert.alert('Save Error', error);
      } else {
        await loadUserProfile();
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out from Casa?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={isEditing ? pickImage : undefined} activeOpacity={0.8}>
            <View style={styles.avatarWrapper}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person-outline" size={40} color={COLORS.textMuted} />
                </View>
              )}
              {isEditing && (
                <View style={styles.cameraIconBadge}>
                  <Ionicons name="camera" size={16} color={COLORS.surface} />
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.nameLabel}>{profile?.full_name || 'Casa Member'}</Text>
          <Text style={styles.roleBadge}>{profile?.role === 'admin' ? 'Admin Access' : 'Customer Account'}</Text>
        </View>

        {isEditing ? (
          /* Profile Edit Form */
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="e.g. Johan Doe"
                  value={value}
                  onChangeText={onChange}
                  error={errors.fullName?.message}
                  iconName="card-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Username"
                  placeholder="e.g. johan_doe"
                  value={value}
                  onChangeText={onChange}
                  error={errors.username?.message}
                  iconName="person-outline"
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Mobile Number"
                  placeholder="e.g. +15551234567"
                  value={value}
                  onChangeText={onChange}
                  error={errors.phoneNumber?.message}
                  iconName="call-outline"
                  keyboardType="phone-pad"
                />
              )}
            />

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Delivery Address"
                  placeholder="e.g. 123 Luxury Ave, Los Angeles, CA"
                  value={value}
                  onChangeText={onChange}
                  error={errors.address?.message}
                  iconName="map-outline"
                />
              )}
            />

            <View style={styles.actionRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setIsEditing(false);
                  loadUserProfile(); // Revert changes
                }}
                style={styles.formBtn}
                disabled={isSaving}
              />
              <Button
                title="Save Changes"
                onPress={handleSubmit(onSubmit)}
                loading={isSaving}
                style={styles.formBtn}
              />
            </View>
          </View>
        ) : (
          /* Profile View State */
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Username</Text>
                <Text style={styles.detailValue}>@{profile?.username || 'not_set'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Email Address</Text>
                <Text style={styles.detailValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Mobile Number</Text>
                <Text style={styles.detailValue}>{profile?.phone_number || 'No phone number added'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="map-outline" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Delivery Address</Text>
                <Text style={styles.detailValue}>{profile?.address || 'No address added'}</Text>
              </View>
            </View>

            <Button
              title="Sign Out"
              variant="outline"
              onPress={handleSignOut}
              style={styles.signOutBtn}
              textStyle={{ color: COLORS.error }}
            />
          </View>
        )}
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
  editBtnText: {
    fontSize: THEME.typography.fontSize.sm,
    fontFamily: THEME.typography.fontFamily.medium,
    color: COLORS.secondary,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.xl * 2,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: THEME.spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: THEME.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  nameLabel: {
    fontSize: THEME.typography.fontSize.md,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  roleBadge: {
    fontSize: THEME.typography.fontSize.xs - 2,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.textSecondary,
    backgroundColor: '#F5F5F7',
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    textTransform: 'uppercase',
  },
  formContainer: {
    paddingHorizontal: THEME.spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.md,
  },
  formBtn: {
    width: '48%',
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: THEME.spacing.lg,
    padding: THEME.spacing.lg,
    ...THEME.shadows.small,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.xs - 2,
    fontFamily: THEME.typography.fontFamily.regular,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.xs + 1,
    fontFamily: THEME.typography.fontFamily.medium,
    color: COLORS.primary,
    marginTop: 2,
  },
  signOutBtn: {
    borderColor: COLORS.border,
    marginTop: THEME.spacing.md,
  },
});

export default ProfileScreen;
