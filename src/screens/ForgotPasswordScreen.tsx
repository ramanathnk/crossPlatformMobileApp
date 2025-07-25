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


interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
  onNavigateToReset: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBackToLogin, onNavigateToReset }) => {
  const [email, setEmail] = useState('');

  const handleSendResetLink = () => {
    // Handle send reset link logic here
    console.log('Send reset link pressed');
    // Navigate to reset password screen
    onNavigateToReset();
  };

  const handleBackToLogin = () => {
    onBackToLogin();
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
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            {/* Send Reset Link Button */}
            <TouchableOpacity style={styles.resetButton} onPress={handleSendResetLink}>
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
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
    marginBottom: 24,
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
  resetButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backToLoginText: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: 8,
  },
});

export default ForgotPasswordScreen;
