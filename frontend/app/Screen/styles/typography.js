import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray[900],
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
    lineHeight: 29,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
    lineHeight: 24,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    lineHeight: 22,
  },
  h5: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    lineHeight: 19,
  },
  
  // Body text
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.gray[800],
    lineHeight: 27,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray[800],
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[800],
    lineHeight: 21,
  },
  
  // Labels and smaller text
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    lineHeight: 17,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.gray[600],
    lineHeight: 16,
  },
  
  // Interactive text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 19,
  },
  link: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary[500],
    lineHeight: 19,
  },
});

export default {};