import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
// Define the navigation param list for the stack
type RootStackParamList = {
  Dashboard: undefined;
  Forgot: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;
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
// Uses this mock to test the page without hitting the API
// Switch between the mock and the actual API as needed
//import { login } from '../api/mocks/authApiMock'; 
import { login } from '../api/authApi';

//console.log('login:', login);



const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Validation: Check if username and password are not empty
  const isFormValid = username.trim().length > 0 && password.trim().length > 0;

  const handleSignIn = async () => {
    if (!isFormValid) {
      CrossPlatformAlert.alert(
        'Validation Error',
        'Please enter both username and password.',
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await login({ username, password });
      await SecureStore.setItemAsync('accessToken', response.accessToken);
      //console.log('Login successful:', response);
      navigation.navigate('Dashboard');
    } catch (err) {
      //console.log('Login failed:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('Forgot');
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
            <Text style={styles.title}>Admin Registration Portal</Text>
            <Text style={styles.subtitle}>Sign in to manage device registrations</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Username Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.textInput}
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
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
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
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon visible={showPassword} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity
              style={[
                styles.signInButton,
                (!isFormValid || loading) && styles.signInButtonDisabled
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
                    (!isFormValid || loading) && styles.signInButtonTextDisabled
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
    backgroundColor: '#1F2937',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 60,
    minHeight: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 28,
    color: '#FFFFFF',
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
    flex: 0,
    minHeight: 200,
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
  textInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
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
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  signInButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signInButtonTextDisabled: {
    color: '#D1D5DB',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: 8,
  },
  error: {
    color: '#FF3B30', // Bright red for high visibility
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,  
  },
});

export default LoginScreen;
