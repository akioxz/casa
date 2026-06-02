import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type OnboardingScreenProps = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const { width, height } = Dimensions.get('window');

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=800',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Soft green overlay */}
        <View style={styles.overlay} pointerEvents="none" />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Top Logo */}
            <View style={styles.header}>
              <Text style={styles.logo}>Casa</Text>
            </View>

            {/* Middle Floating Discount Card (Glassmorphism) */}
            <View style={styles.discountContainer}>
              <View style={styles.glassCard}>
                <Text style={styles.discountTitle}>Update</Text>
                <Text style={styles.discountValue}>25% Discount</Text>
              </View>
            </View>

            {/* Bottom Content Info */}
            <View style={styles.body}>
              <Text style={styles.title}>
                Transform Your{'\n'}Home with <Text style={styles.highlightText}>Elegance!</Text>
              </Text>
              <Text style={styles.subtitle}>
                Elevate your space with timeless furniture designed for comfort & modern style.
              </Text>
            </View>

            {/* Get Started Footer Deck */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.circleBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="home-outline" size={24} color={COLORS.surface} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.getStartedBar}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <View style={styles.arrowIconContainer}>
                  <Ionicons name="chevron-forward-outline" size={16} color={COLORS.primary} style={styles.arrowIcon} />
                  <Ionicons name="chevron-forward-outline" size={16} color={COLORS.primary} style={styles.arrowIcon} />
                  <Ionicons name="chevron-forward-outline" size={16} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 61, 38, 0.45)', // Sage tint overlay
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: THEME.spacing.md,
  },
  logo: {
    fontSize: THEME.typography.fontSize.xxl,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '800',
    color: COLORS.surface,
    letterSpacing: 2,
  },
  discountContainer: {
    alignItems: 'flex-end',
    marginRight: -10,
    marginTop: height * 0.05,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  discountTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: THEME.typography.fontSize.xs - 2,
    fontFamily: THEME.typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discountValue: {
    color: COLORS.surface,
    fontSize: THEME.typography.fontSize.xs + 1,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '700',
    marginTop: 2,
  },
  body: {
    marginTop: height * 0.1,
  },
  title: {
    fontSize: THEME.typography.fontSize.h1 - 2,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    color: COLORS.surface,
    lineHeight: (THEME.typography.fontSize.h1 - 2) * 1.25,
    marginBottom: THEME.spacing.md,
  },
  highlightText: {
    fontStyle: 'italic',
    textDecorationLine: 'underline',
    fontWeight: '800',
    color: '#D8ECE1', // Pale light sage highlights
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.sm,
    fontFamily: THEME.typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
  },
  circleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedBar: {
    flex: 1,
    marginLeft: THEME.spacing.md,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: THEME.spacing.lg,
    paddingRight: THEME.spacing.md,
  },
  getStartedText: {
    color: COLORS.surface,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: THEME.typography.fontSize.xs + 2,
  },
  arrowIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  arrowIcon: {
    marginRight: -8,
  },
});

export default OnboardingScreen;
