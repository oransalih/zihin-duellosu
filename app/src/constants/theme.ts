import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Re-export helpers for use in individual files
export const ms = (size: number, factor = 0.3) => moderateScale(size, factor);
export const s = scale;
export const vs = verticalScale;

export const Colors = {
  background: '#1A1D2A',
  surface: '#242838',
  surfaceLight: '#2C3048',
  surfaceBorder: '#363A50',
  primary: '#5A7A2E',
  primaryLight: '#7A9E3E',
  primaryDark: '#3E5520',
  primaryGlow: 'rgba(90, 122, 46, 0.3)',
  secondary: '#FF6B6B',
  text: '#E0E0EA',
  textBright: '#FFFFFF',
  textSecondary: '#8A8EA8',
  textMuted: '#555878',
  textGreen: '#8FBC3E',
  bull: '#D4A017',
  bullBg: 'rgba(212, 160, 23, 0.15)',
  cow: '#5A7A2E',
  cowBg: 'rgba(90, 122, 46, 0.15)',
  error: '#FF4444',
  success: '#5A7A2E',
  border: '#363A50',
  overlay: 'rgba(0, 0, 0, 0.8)',
  cardBg: '#1E2235',
};

export const Spacing = {
  xs: moderateScale(4, 0.3),
  sm: moderateScale(8, 0.3),
  md: moderateScale(16, 0.3),
  lg: moderateScale(24, 0.3),
  xl: moderateScale(32, 0.3),
  xxl: moderateScale(48, 0.3),
};

export const FontSize = {
  xs: moderateScale(11, 0.4),
  sm: moderateScale(13, 0.4),
  md: moderateScale(15, 0.4),
  lg: moderateScale(18, 0.4),
  xl: moderateScale(22, 0.4),
  xxl: moderateScale(28, 0.4),
  title: moderateScale(36, 0.4),
  hero: moderateScale(44, 0.4),
};

export const BorderRadius = {
  sm: moderateScale(6, 0.3),
  md: moderateScale(10, 0.3),
  lg: moderateScale(14, 0.3),
  xl: moderateScale(20, 0.3),
  full: 9999,
};
