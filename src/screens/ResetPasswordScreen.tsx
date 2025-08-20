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
  const serverError = authState.error;
  const serverMessage = authState.message;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // show server errors/messages in local state so UI layout stays the same
    setError(serverError);
  }, [serverError]);

  useEffect(() => {
    setMessage(serverMessage);
    if (serverMessage) {
      // navigate to login after a short delay
      setTimeout(() => {
        navigation.replace('Login');
      }, 1200);
    }
  }, [serverMessage, navigation]);

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
      await dispatch(
        resetPasswordThunk({
          email: email ?? '',
          token: token ?? '',
          newPassword,
        }),
      ).unwrap();
      // success is handled by slice -> message and navigation effect
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password.');
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
                  placeholderTextColor="#6B7280"
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
                  <EyeIcon visible={showNewPassword} size={20} color="#9CA3AF" />
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
                  placeholderTextColor="#6B7280"
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
                  <EyeIcon visible={showConfirmPassword} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error or Success Message */}
            {(error || serverError) && (
              <Text style={{ color: '#FF3B30', fontWeight: 'bold', marginBottom: 12 }}>
                {error || serverError}
              </Text>
            )}
            {(message || serverMessage) && (
              <Text style={{ color: '#10B981', fontWeight: 'bold', marginBottom: 12 }}>
                {message || serverMessage}
              </Text>
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
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
    fontWeight: '500',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  passwordHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  resetButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resetButtonTextDisabled: {
    color: '#D1D5DB',
  },
  backToLoginText: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 16,
  },
});

export default ResetPasswordScreen;
