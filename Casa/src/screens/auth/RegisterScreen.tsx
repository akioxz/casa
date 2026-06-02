import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import useAuthStore from '../../store/authStore';
import { signupSchema } from '../../utils/validation';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [formError, setFormError] = useState('');

  const { signUp, isSubmitting, isMockMode } = useAuthStore();

  const validate = () => {
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setUsernameError('');
    setFullNameError('');
    setPhoneNumberError('');
    setAddressError('');
    setFormError('');

    let valid = true;

    // Verify Password Match first before schema check
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }

    const result = signupSchema.safeParse({
      email,
      password,
      username,
      fullName,
      phoneNumber,
      address,
    });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === 'email') setEmailError(issue.message);
        if (path === 'password') setPasswordError(issue.message);
        if (path === 'username') setUsernameError(issue.message);
        if (path === 'fullName') setFullNameError(issue.message);
        if (path === 'phoneNumber') setPhoneNumberError(issue.message);
        if (path === 'address') setAddressError(issue.message);
      });
      return false;
    }

    return valid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    const { error } = await signUp({
      email,
      password,
      username,
      fullName,
      phoneNumber,
      address,
    });

    if (error) {
      setFormError(error);
    } else if (!isMockMode) {
      Alert.alert(
        'Registration Successful',
        'Please check your email inbox to verify your account before logging in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
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
                ⚠️ Mock Mode Active: Enter any details to register.
              </Text>
            </View>
          )}

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Casa to browse unique furniture</Text>
          
          <View style={styles.card}>
            {!!formError && <Text style={styles.formErrorText}>{formError}</Text>}

            <Input
              label="Username"
              placeholder="e.g. johan_doe"
              value={username}
              onChangeText={setUsername}
              error={usernameError}
              iconName="person-outline"
              autoCapitalize="none"
            />

            <Input
              label="Full Name"
              placeholder="e.g. Johan Doe"
              value={fullName}
              onChangeText={setFullName}
              error={fullNameError}
              iconName="card-outline"
            />

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
              label="Phone Number"
              placeholder="e.g. +15551234567"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              error={phoneNumberError}
              iconName="call-outline"
              keyboardType="phone-pad"
            />

            <Input
              label="Delivery Address"
              placeholder="e.g. 123 Main St, New York, NY"
              value={address}
              onChangeText={setAddress}
              error={addressError}
              iconName="map-outline"
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
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={confirmPasswordError}
              iconName="lock-closed-outline"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
            />

            <Button
              title="Sign Up"
              onPress={handleSignUp}
              loading={isSubmitting}
              style={styles.button}
            />

            <Button
              title="Already have an account? Sign In"
              variant="text"
              onPress={() => navigation.navigate('Login')}
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
  title: {
    fontSize: THEME.typography.fontSize.xxl,
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
    marginBottom: THEME.spacing.md,
  },
});
export default RegisterScreen;
