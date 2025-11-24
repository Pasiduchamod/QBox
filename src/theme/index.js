// Theme configuration - Modern, minimal design with soft colors
export const colors = {
  // Primary colors - Soft blue/green palette
  primary: '#6366F1',        // Indigo blue
  primaryLight: '#818CF8',   // Light indigo
  primaryDark: '#4F46E5',    // Dark indigo
  
  secondary: '#10B981',      // Emerald green
  secondaryLight: '#34D399', // Light emerald
  secondaryDark: '#059669',  // Dark emerald
  
  // Neutral colors
  white: '#FFFFFF',
  background: '#F9FAFB',     // Very light grey
  surface: '#FFFFFF',
  border: '#E5E7EB',         // Light grey border
  
  // Text colors
  textPrimary: '#111827',    // Almost black
  textSecondary: '#6B7280',  // Medium grey
  textTertiary: '#9CA3AF',   // Light grey
  
  // Status colors
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Red
  info: '#3B82F6',           // Blue
  
  // Card states
  approved: '#D1FAE5',       // Light green
  answered: '#DBEAFE',       // Light blue
  pending: '#FEF3C7',        // Light yellow
  hidden: '#F3F4F6',         // Light grey
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Font weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export default theme;
