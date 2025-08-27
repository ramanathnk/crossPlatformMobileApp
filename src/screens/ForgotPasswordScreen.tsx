import React, { useState } from 'react';
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
import SnaptrackerLogo from '../icons/SnapTrackerLogo';
import { useForgotPassword } from '../api/authApiRQ';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import CrossPlatformAlert from '../utils/CrossPlatformAlert';

type RootStackParamList = {
  Login: undefined;
  Reset: { token: string; expiresAt: string; email: string };
};
type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reset'>;

type ForgotPasswordResponse = {
  token?: string;
  message?: string;
  expiresAt?: string;
};

const isForgotPasswordResponse = (obj: unknown): obj is ForgotPasswordResponse =>
  !!obj && typeof obj === 'object' && ('token' in obj || 'message' in obj || 'expiresAt' in obj);

// Color tokens to avoid inline color literals in JSX/styles
const COLORS = {
  bg: '#1F2937',
  panel: '#374151',
  panelBorder: '#4B5563',
  text: '#FFFFFF',
  muted: '#6B7280',
  label: '#D1D5DB',
  danger: '#FF3B30',
  success: '#10B981',
  primary: '#3B82F6',
};

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Use the React Query hook for forgot password
  const {
    mutate: forgotPasswordMutate,
    isPending: loading,
    isError,
    error: mutationError,
    data: mutationData,
  } = useForgotPassword();

  const handleSendResetLink = () => {
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    forgotPasswordMutate(
      { email },
      {
        onSuccess: (response) => {
          // Ensure response is a shape we expect and has a token property
          if (!isForgotPasswordResponse(response) || !response.token) {
            setMessage(null);
            setError('Unable to proceed further');
            return;
          }

          const tokenStr = response.token;

          CrossPlatformAlert.alert('Reset Link Sent', 'You can now reset your password.', [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('Reset', {
                  token: tokenStr,
                  expiresAt: response.expiresAt ?? '',
                  email: email,
                }),
            },
          ]);

          setMessage(response.message || 'Reset link sent! Check your email.');
          setError(null);
        },
        onError: (err: unknown) => {
          // Narrow unknown error safely
          setMessage(null);
          let msg = 'Failed to send reset link.';
          if (typeof err === 'string') {
            msg = err;
          } else if (err instanceof Error && err.message) {
            msg = err.message;
          } else if (err && typeof err === 'object') {
            const e = err as Record<string, unknown>;
            if (typeof e['message'] === 'string') msg = e['message'] as string;
          }
          setError(msg);
        },
      },
    );
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  // Show error from mutation if not already set locally
  const displayError =
    error || (isError && mutationError instanceof Error ? mutationError.message : null);

  // Show message only if we set it locally OR if mutationData includes a token (defensive)
  const displayMessage =
    message ??
    (isForgotPasswordResponse(mutationData) && mutationData.token
      ? (mutationData.message ?? null)
      : null);

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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email address to receive a reset link</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="your@example.com"
                placeholderTextColor={COLORS.muted}
                value={email}
                onChangeText={setEmail}
                autoCorrect={false}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Error or Backend Message */}
            {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}
            {displayMessage ? <Text style={styles.successText}>{displayMessage}</Text> : null}

            {/* Send Reset Link Button */}
            <TouchableOpacity
              style={[styles.resetButton, loading && styles.resetButtonLoading]}
              onPress={handleSendResetLink}
              disabled={loading}
            >
              <Text style={styles.resetButtonText}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.backToLoginText}>Remember your password? Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: 14,
    paddingVertical: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  container: {
    backgroundColor: COLORS.bg,
    flex: 1,
  },
  errorText: {
    color: COLORS.danger,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  formContainer: {
    flex: 0,
    minHeight: 200,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    color: COLORS.label,
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
  resetButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: 32,
    marginTop: 8,
    paddingVertical: 16,
  },
  resetButtonLoading: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100%',
    paddingBottom: 60,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  successText: {
    color: COLORS.success,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: COLORS.panel,
    borderColor: COLORS.panelBorder,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: COLORS.text,
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

export default ForgotPasswordScreen;
