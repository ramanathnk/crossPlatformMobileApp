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
          // If server didn't return a token, show a clear error and don't proceed.
          if (!response || !response.token) {
            // Don't set any server message when token is missing.
            setMessage(null);
            setError('Unable to proceed further');
            return;
          }

          // response.token is guaranteed to exist here; help TypeScript by asserting non-null.
          const tokenStr = response.token!;

          // If token is present, allow the user to proceed to Reset screen.
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

          // Only set the server message when a token is present.
          setMessage(response.message || 'Reset link sent! Check your email.');
          setError(null);
        },
        onError: (err: any) => {
          // On error, show the error and clear any success message.
          setMessage(null);
          setError(err?.message || 'Failed to send reset link.');
        },
      },
    );
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  // Show error from mutation if not already set locally
  const displayError = error || (isError && (mutationError as Error)?.message);
  // Show message only if we set it locally OR if mutationData includes a token (defensive),
  // otherwise don't show the server message when token is missing.
  const displayMessage =
    message ?? (mutationData && (mutationData as any).token ? (mutationData as any).message : null);

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
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                autoCorrect={false}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Error or Backend Message */}
            {displayError && (
              <Text style={{ color: '#FF3B30', fontWeight: 'bold', marginBottom: 12 }}>
                {displayError}
              </Text>
            )}
            {displayMessage && (
              <Text style={{ color: '#10B981', fontWeight: 'bold', marginBottom: 12 }}>
                {displayMessage}
              </Text>
            )}

            {/* Send Reset Link Button */}
            <TouchableOpacity
              style={[styles.resetButton, loading && { opacity: 0.6 }]}
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
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
  },
  backToLoginText: {
    color: '#3B82F6',
    fontSize: 14,
    paddingVertical: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  container: {
    backgroundColor: '#1F2937',
    flex: 1,
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
    color: '#D1D5DB',
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
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    marginBottom: 32,
    marginTop: 8,
    paddingVertical: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
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
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    borderRadius: 8,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: '#FFFFFF',
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
