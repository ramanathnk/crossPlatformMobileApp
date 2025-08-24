import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { inputStyles, buttonStyles, errorStyles } from '../styles/commonStyles';
import { colors, spacing, fontSizes } from '../styles/theme';
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
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CrossPlatformAlert from '../utils/CrossPlatformAlert';
import SnaptrackerLogo from '../icons/SnapTrackerLogo';
import EyeIcon from '../icons/EyeIcon';
import * as SecureStore from 'expo-secure-store';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { loginThunk, clearError } from '../store/authSlice';

type RootStackParamList = {
  MainTabs: undefined;
  Forgot: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const loading = authState.loading;
  const serverError = authState.error;

  useEffect(() => {
    // If server error changes, surface it locally
    setLocalError(serverError);
  }, [serverError]);

  // Validation: Check if username and password are not empty
  const isFormValid = username.trim().length > 0 && password.trim().length > 0;

  const handleSignIn = async () => {
    if (!isFormValid) {
      CrossPlatformAlert.alert('Validation Error', 'Please enter both username and password.', [
        {
          text: 'OK',
          style: 'default',
        },
      ]);
      return;
    }

    setLocalError(null);

    try {
      const response = await dispatch(loginThunk({ username, password })).unwrap();
      // Store token centrally (you can move this into the thunk if preferred)
      if (response.accessToken) {
        await SecureStore.setItemAsync('accessToken', response.accessToken);
      }
      navigation.navigate('MainTabs');
    } catch (err: any) {
      setLocalError(err?.description || err?.message || 'Login failed');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('Forgot');
  };

  const displayError = localError;

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
              {/* smaller logo so the icon and text sit tightly together */}
              <SnaptrackerLogo width={42} height={42} />
              <Text style={styles.appName}>SnapTracker</Text>
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Admin Registration Portal</Text>
            <Text style={styles.subtitle}>Sign in to manage device registrations</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Username Field */}
            <View style={styles.inputContainer}>
              <Text style={inputStyles.label}>Username</Text>
              <TextInput
                testID="username-input"
                style={inputStyles.textInput}
                placeholder="Enter your username"
                placeholderTextColor="#6B7280"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={inputStyles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  testID="password-input"
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  testID="toggle-password-visibility"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon visible={showPassword} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            {displayError && <Text style={styles.error}>{displayError}</Text>}
            <TouchableOpacity
              testID="sign-in-button"
              style={[
                styles.signInButton,
                (!isFormValid || loading) && styles.signInButtonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text
                  style={[
                    styles.signInButtonText,
                    (!isFormValid || loading) && styles.signInButtonTextDisabled,
                  ]}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
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
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: 60,
    minHeight: '100%',
  },
  headerContainer: {
    // center the header group horizontally
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  // logoContainer positions icon and name tightly as a centered unit
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: fontSizes.xxlarge,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6, // reduce gap so text sits closer to the logo
    // slightly adjust lineHeight to vertically center text with the icon
    lineHeight: fontSizes.xxlarge + 4,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: fontSizes.xlarge,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.medium,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    flex: 0,
    minHeight: 200,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    ...inputStyles.textInput,
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButton: {
    ...buttonStyles.primary,
  },
  signInButtonDisabled: {
    ...buttonStyles.disabled,
  },
  signInButtonText: {
    ...buttonStyles.text,
  },
  signInButtonTextDisabled: {
    ...buttonStyles.textDisabled,
  },
  forgotPasswordText: {
    fontSize: fontSizes.medium,
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: spacing.sm,
  },
  error: {
    ...errorStyles.error,
  },
});

export default LoginScreen;
