import React, { useState, forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, THEME } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  iconName?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      containerStyle,
      inputStyle,
      labelStyle,
      iconName,
      secureTextEntry,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const isPassword = secureTextEntry;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
        
        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
            !!error && styles.inputWrapperError,
          ]}
        >
          {iconName && (
            <Ionicons
              name={iconName}
              size={20}
              color={error ? COLORS.error : isFocused ? COLORS.primary : COLORS.textSecondary}
              style={styles.leftIcon}
            />
          )}

          <TextInput
            ref={ref}
            style={[styles.input, inputStyle]}
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={isPassword && !isPasswordVisible}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {isPassword && (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.rightIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.textSecondary}
              />
            </Pressable>
          )}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {!error && !!helperText && <Text style={styles.helperText}>{helperText}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.medium,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs + 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.textPrimary,
    fontFamily: THEME.typography.fontFamily.regular,
    fontSize: THEME.typography.fontSize.sm,
    paddingVertical: 0,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.xs - 1,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontFamily: THEME.typography.fontFamily.regular,
  },
  helperText: {
    fontSize: THEME.typography.fontSize.xs - 1,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontFamily: THEME.typography.fontFamily.regular,
  },
});

export default Input;
