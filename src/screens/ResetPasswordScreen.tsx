import React, { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CrossPlatformAlert from '../utils/CrossPlatformAlert';
import SnaptrackerLogo from '../icons/SnapTrackerLogo';
import EyeIcon from '../icons/EyeIcon';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { resetPasswordThunk, clearError, clearMessage } from '../store/authSlice';

/**
 * Small helpers to safely read string properties from unknown values and normalize errors.
 */
function getStringProp(obj: unknown, key: string): string | null {
  if (obj && typeof obj === 'object') {
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === 'string' ? v : null;
  }
  return null;
}

function extractErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err instanceof Error && err.message) return err.message;
  const msg = getStringProp(err, 'message') ?? getStringProp(err, 'description');
  return msg ?? fallback;
}

/**
 * Centralized color tokens to satisfy react-native/no-color-literals and keep consistent styles.
 */
const COLORS = {
  white: '#FFFFFF',
  primary: '#3B82F6',
  muted: '#9CA3AF',
  inputBg: '#374151',
  inputBorder: '#4B5563',
  bg: '#1F2937',
  textMuted: '#D1D5DB',
  success: '#10B981',
  danger: '#FF3B30',
  disabledBg: '#6B7280',
  resultsBg: '#262f37',
  resultsBorder: '#2f3a42',
  fail: '#EF4444',
  resultError: '#FCA5A5',
};

type RootStackParamList = {
  Login: undefined;
  ResetPassword: { token: string; email: string };
};
type ResetPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<{
    key: string;
    name: string;
    params: { token: string; email: string; expiresAt?: string } | undefined;
  }>();
  const token = route.params?.token;
  const email = route.params?.email;

  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const loading = authState.loading;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Mirror server error into local state for inline display (optional).
    setError(authState.error ?? null);
  }, [authState.error]);

  // NOTE: we intentionally do NOT auto-navigate on authState.message anymore.
  // Navigation occurs only after user confirms the alert shown below.

  // Reset password validation
  const isResetFormValid =
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    newPassword === confirmPassword &&
    newPassword.length >= 8;

  const handleResetPassword = async () => {
    setError(null);
    setMessage(null);
    if (!isResetFormValid) {
      let errorMessage = '';
      if (newPassword.trim().length === 0 || confirmPassword.trim().length === 0) {
        errorMessage = 'Please fill in both password fields.';
      } else if (newPassword.length < 8) {
        errorMessage = 'Password must be at least 8 characters long.';
      } else if (newPassword !== confirmPassword) {
        errorMessage = 'Passwords do not match.';
      }
      CrossPlatformAlert.alert('Validation Error', errorMessage, [
        { text: 'OK', style: 'default' },
      ]);
      return;
    }

    if (!token || !email) {
      setError('Invalid or missing reset token/email.');
      return;
    }

    // Dispatch the redux thunk (which calls the API)
    try {
      const res = await dispatch(
        resetPasswordThunk({
          email: email ?? '',
          token: token ?? '',
          newPassword,
        }),
      ).unwrap();

      const successMessage =
        getStringProp(res, 'message') ?? 'Password reset successful. You can now log in.';

      // Show alert with success message and navigate to Login after user confirmation.
      CrossPlatformAlert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            // Clear any leftover auth slice messages/errors to keep state clean.
            try {
              dispatch(clearMessage());
              dispatch(clearError());
            } catch {
              /* ignore */
            }
            navigation.navigate('Login');
          },
        },
      ]);

      setMessage(successMessage);
    } catch (err: unknown) {
      // Normalize error message (thunk rejection can be string or object)
      const errMsg = extractErrorMessage(err, authState.error ?? 'Failed to reset password.');

      CrossPlatformAlert.alert('Error', errMsg, [
        {
          text: 'OK',
          onPress: () => {
            try {
              dispatch(clearMessage());
              dispatch(clearError());
            } catch {
              /* ignore */
            }
            navigation.navigate('Login');
          },
        },
      ]);

      setError(errMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo and App Name */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <SnaptrackerLogo width={120} height={50} />
              <Text style={styles.appName}>SnapTracker</Text>
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>Create a new password for your account</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* New Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  placeholderTextColor={COLORS.muted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <EyeIcon visible={showNewPassword} size={20} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>Min. 8 characters</Text>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor={COLORS.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <EyeIcon visible={showConfirmPassword} size={20} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error or Success Message (inline) */}
            {(error || authState.error) && (
              <Text style={styles.inlineErrorText}>{error || authState.error}</Text>
            )}
            {(message || authState.message) && (
              <Text style={styles.inlineSuccessText}>{message || authState.message}</Text>
            )}

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                (!isResetFormValid || loading) && styles.resetButtonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={!isResetFormValid || loading}
            >
              <Text
                style={[
                  styles.resetButtonText,
                  (!isResetFormValid || loading) && styles.resetButtonTextDisabled,
                ]}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  container: {
    backgroundColor: COLORS.bg,
    flex: 1,
  },
  eyeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'absolute',
    right: 16,
    top: 14,
  },
  formContainer: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  // Moved inline message styles up so style keys are in ascending order relative to titleSection
  inlineErrorText: {
    color: COLORS.danger,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inlineSuccessText: {
    color: COLORS.success,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordHint: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  passwordInput: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.white,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingRight: 50,
    paddingVertical: 14,
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: 24,
    marginTop: 8,
    paddingVertical: 16,
  },
  resetButtonDisabled: {
    backgroundColor: COLORS.disabledBg,
    opacity: 0.6,
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 60,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
});

export default ResetPasswordScreen;
