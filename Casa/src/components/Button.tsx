import React from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  Pressable,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, THEME } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    const baseStyle = styles.base;
    const variantStyle = styles[variant];
    const sizeStyle = styles[size];
    const disabledStyle = disabled ? styles.disabled : null;

    return [baseStyle, variantStyle, sizeStyle, disabledStyle, style];
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const baseText = styles.baseText;
    const variantText = styles[`${variant}Text` as keyof typeof styles] as TextStyle;
    const sizeText = styles[`${size}Text` as keyof typeof styles] as TextStyle;
    const disabledText = disabled ? styles.disabledText : null;

    return [baseText, variantText, sizeText, disabledText, textStyle];
  };

  const getIndicatorColor = () => {
    if (variant === 'primary') return COLORS.surface;
    if (variant === 'secondary') return COLORS.surface;
    return COLORS.primary;
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getButtonStyles() as ViewStyle,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getIndicatorColor()} />
      ) : (
        <>
          {icon && !loading && <React.Fragment>{icon}</React.Fragment>}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },

  // Sizes
  small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  medium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  large: {
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },

  // Typography Base
  baseText: {
    fontFamily: THEME.typography.fontFamily.medium,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Variant Text Colors
  primaryText: {
    color: COLORS.surface,
  },
  secondaryText: {
    color: COLORS.surface,
  },
  outlineText: {
    color: COLORS.primary,
  },
  textText: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.textMuted,
  },

  // Size Text Styles
  smallText: {
    fontSize: THEME.typography.fontSize.xs,
  },
  mediumText: {
    fontSize: THEME.typography.fontSize.sm,
  },
  largeText: {
    fontSize: THEME.typography.fontSize.md,
  },
});

export default Button;
