import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { COLORS, SPACING, THEME } from '../constants/theme';

interface LoadingProps {
  fullscreen?: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  fullscreen = false,
  message,
  size = 'large',
  color = COLORS.primary,
}) => {
  if (fullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <View style={styles.modal}>
          <ActivityIndicator size={size} color={color} />
          {message && <Text style={styles.messageText}>{message}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.messageTextInline}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    minWidth: 120,
  },
  inlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  messageText: {
    marginTop: SPACING.md,
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.textPrimary,
    fontFamily: THEME.typography.fontFamily.medium,
    fontWeight: '500',
  },
  messageTextInline: {
    marginTop: SPACING.sm,
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.textSecondary,
    fontFamily: THEME.typography.fontFamily.regular,
  },
});

export default Loading;
