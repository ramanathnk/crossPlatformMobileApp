import { StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, borderRadius, fontWeights } from './theme';

export const inputStyles = StyleSheet.create({
  label: {
    color: colors.inputLabel,
    fontSize: fontSizes.medium,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: fontSizes.large,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});

export const buttonStyles = StyleSheet.create({
  disabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  primary: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.lg,
  },
  text: {
    color: colors.text,
    fontSize: fontSizes.large,
    fontWeight: fontWeights.semibold,
  },
  textDisabled: {
    color: colors.inputLabel,
  },
});

export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  detail: {
    color: colors.muted,
    fontSize: fontSizes.medium,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.large,
    fontWeight: fontWeights.semibold,
  },
});

export const textStyles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontSize: fontSizes.xlarge,
    fontWeight: fontWeights.bold,
  },
  muted: {
    color: colors.muted,
  },
  subtitle: {
    color: colors.muted,
    fontSize: fontSizes.medium,
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