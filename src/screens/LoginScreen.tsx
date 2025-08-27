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
import { loginThunk } from '../store/authSlice';

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
      const responseUnknown = await dispatch(loginThunk({ username, password })).unwrap();

      // Avoid direct cast from a typed API response to Record<string, unknown>.
      // Instead inspect the runtime shape and read accessToken safely.
      if (responseUnknown && typeof responseUnknown === 'object') {
        // narrow using `any` just for runtime property access (keeps the type-conversion warning away)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maybeAccessToken = (responseUnknown as any).accessToken;
        if (typeof maybeAccessToken === 'string' && maybeAccessToken.length > 0) {
          await SecureStore.setItemAsync('accessToken', maybeAccessToken);
        }
      }

      navigation.navigate('MainTabs');
    } catch (err: unknown) {
      let message = 'Login failed';
      if (typeof err === 'string') {
        message = err;
      } else if (err instanceof Error && err.message) {
        message = err.message;
      } else if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;
        if (typeof e['description'] === 'string') {
          message = e['description'] as string;
        } else if (typeof e['message'] === 'string') {
          message = e['message'] as string;
        }
      }
      setLocalError(message);
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
  appName: {
    color: colors.text,
    fontSize: fontSizes.xxlarge,
    fontWeight: '600',
    lineHeight: fontSizes.xxlarge + 4,
    marginLeft: 6,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  error: {
    ...errorStyles.error,
  },
  eyeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'absolute',
    right: 16,
    top: 14,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: fontSizes.medium,
    paddingVertical: spacing.sm,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  formContainer: {
    flex: 0,
    minHeight: 200,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    ...inputStyles.textInput,
    paddingRight: 50,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100%',
    paddingBottom: 60,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
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
  subtitle: {
    color: colors.muted,
    fontSize: fontSizes.medium,
    lineHeight: 20,
    textAlign: 'center',
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xlarge,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
});

export default LoginScreen;
