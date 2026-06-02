import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import useAuthStore from '../../store/authStore';
import { loginSchema } from '../../utils/validation';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  
  const { signIn, isSubmitting, isMockMode } = useAuthStore();

  const validate = () => {
    setEmailError('');
    setPasswordError('');
    setFormError('');

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === 'email') setEmailError(issue.message);
        if (path === 'password') setPasswordError(issue.message);
      });
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    const { error } = await signIn({ email, password });
    if (error) {
      setFormError(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {isMockMode && (
            <View style={styles.mockBanner}>
              <Text style={styles.mockBannerText}>
                ⚠️ Mock Mode Active: Use any email & pwd.
              </Text>
              <Text style={styles.mockBannerSubtext}>
                (Use "admin@casa.com" for Admin role, others for Customer)
              </Text>
            </View>
          )}

          <Text style={styles.title}>Casa</Text>
          <Text style={styles.subtitle}>Welcome to premium furniture shopping</Text>
          
          <View style={styles.card}>
            {!!formError && <Text style={styles.formErrorText}>{formError}</Text>}

            <Input
              label="Email Address"
              placeholder="e.g. johan@example.com"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              iconName="mail-outline"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              iconName="lock-closed-outline"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={isSubmitting}
              style={styles.button}
            />

            <Button
              title="Create Account"
              variant="outline"
              onPress={() => navigation.navigate('Register')}
              style={styles.button}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: THEME.spacing.lg,
  },
  mockBanner: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.xl,
    alignItems: 'center',
  },
  mockBannerText: {
    color: '#E65100',
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '700',
  },
  mockBannerSubtext: {
    color: '#EF6C00',
    fontSize: THEME.typography.fontSize.xs - 2,
    fontFamily: THEME.typography.fontFamily.regular,
    marginTop: 2,
  },
  title: {
    fontSize: THEME.typography.fontSize.h1,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    ...THEME.shadows.medium,
  },
  formErrorText: {
    color: COLORS.error,
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.medium,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  button: {
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
});
export default LoginScreen;
