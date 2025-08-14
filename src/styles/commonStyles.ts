import { StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, borderRadius, fontWeights } from './theme';

export const inputStyles = StyleSheet.create({
  label: {
    fontSize: fontSizes.medium,
    color: colors.inputLabel,
    marginBottom: spacing.sm,
    fontWeight: fontWeights.medium,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.large,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  disabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  text: {
    fontSize: fontSizes.large,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  textDisabled: {
    color: colors.inputLabel,
  },
});

export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.large,
    fontWeight: fontWeights.semibold,
  },
  detail: {
    color: colors.muted,
    fontSize: fontSizes.medium,
  },
});

export const textStyles = StyleSheet.create({
  heading: {
    fontSize: fontSizes.xlarge,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.medium,
    color: colors.muted,
  },
  muted: {
    color: colors.muted,
  },
});

export const errorStyles = StyleSheet.create({
  error: {
    color: colors.error,
    fontSize: fontSizes.large,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.md,
  },
});