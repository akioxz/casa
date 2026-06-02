import { Platform } from 'react-native';

export const COLORS = {
  // Brand Colors
  primary: '#0D3D26',       // Deep Forest/Emerald Green
  secondary: '#2E5A44',     // Rich Sage Green
  accent: '#C08A3E',        // Brushed Brass/Gold (Luxury accent)
  
  // Backgrounds
  background: '#F2F7F4',    // Soft Minty Off-white
  surface: '#FFFFFF',       // Clean white for cards
  surfaceVariant: '#E4EDE8', // Soft pale green/stone for secondary containers
  
  // Neutral Tones
  textPrimary: '#1A2E22',   // Deep green-tinted charcoal
  textSecondary: '#5A6B61', // Muted sage gray for labels
  textMuted: '#93A89C',     // Light gray-green for placeholder/inactive states
  border: '#DDE6E1',        // Soft minty border line
  
  // System Colors
  success: '#2E7D32',       // Classic deep green
  error: '#C62828',         // Classic red
  warning: '#EF6C00',       // Warm orange
  info: '#1565C0',          // Classic blue
  
  // Overlay
  overlay: 'rgba(13, 61, 38, 0.4)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
    medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    bold: Platform.select({ ios: 'System', android: 'sans-serif-bold' }),
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    h1: 32,
    h2: 28,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#2C2A29',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#2C2A29',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#2C2A29',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const THEME = {
  colors: COLORS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
};

export default THEME;
