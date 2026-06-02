import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import Button from '../../components/Button';

type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email to receive a recovery link</Text>
      <View style={styles.card}>
        <Text style={styles.placeholderText}>Forgot Password Form Placeholder</Text>
        <Button
          title="Send Recovery Link"
          onPress={() => {}}
          style={styles.button}
        />
        <Button
          title="Back to Sign In"
          variant="text"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: THEME.spacing.lg,
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
  placeholderText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: THEME.spacing.xl,
  },
  button: {
    marginBottom: THEME.spacing.md,
  },
});
export default ForgotPasswordScreen;
