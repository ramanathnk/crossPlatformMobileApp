import { StatusBar } from 'expo-status-bar';
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
  Alert,
} from 'react-native';
import { useState } from 'react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'forgot' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Reset password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation: Check if username and password are not empty
  const isFormValid = username.trim().length > 0 && password.trim().length > 0;
  
  // Forgot password validation  
  const isForgotFormValid = email.trim().length > 0 && email.includes('@');
  
  // Reset password validation
  const isResetFormValid = newPassword.trim().length > 0 && 
                          confirmPassword.trim().length > 0 && 
                          newPassword === confirmPassword &&
                          newPassword.length >= 8;

  const handleSignIn = () => {
    if (!isFormValid) {
      Alert.alert(
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

    Alert.alert(
      'Sign In',
      `Welcome ${username}! Sign in was successful.`,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  const handleForgotPassword = () => {
    setCurrentScreen('forgot');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  const handleSendResetLink = () => {
    if (!isForgotFormValid) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid email address.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Reset Link Sent',
      `A password reset link has been sent to ${email}. Please check your email and follow the instructions.`,
      [
        { 
          text: 'OK', 
          style: 'default',
          onPress: () => setCurrentScreen('reset') // Simulate going to reset page
        }
      ]
    );
  };

  const handleResetPassword = () => {
    if (!isResetFormValid) {
      let errorMessage = '';
      if (newPassword.trim().length === 0 || confirmPassword.trim().length === 0) {
        errorMessage = 'Please fill in both password fields.';
      } else if (newPassword.length < 8) {
        errorMessage = 'Password must be at least 8 characters long.';
      } else if (newPassword !== confirmPassword) {
        errorMessage = 'Passwords do not match.';
      }
      
      Alert.alert(
        'Validation Error',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Password Reset',
      'Your password has been reset successfully!',
      [
        { 
          text: 'OK', 
          style: 'default',
          onPress: () => setCurrentScreen('login')
        }
      ]
    );
  };

  const renderLoginScreen = () => (
    <>
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
              <View style={styles.eyeIconContainer}>
                {showPassword ? (
                  // Eye with slash (password hidden)
                  <View style={styles.eyeWrapper}>
                    <View style={styles.eyeOutline} />
                    <View style={styles.eyeDot} />
                    <View style={styles.slashLine} />
                  </View>
                ) : (
                  // Normal eye (password visible)
                  <View style={styles.eyeWrapper}>
                    <View style={styles.eyeOutline} />
                    <View style={styles.eyeDot} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity 
          style={[
            styles.signInButton, 
            !isFormValid && styles.signInButtonDisabled
          ]} 
          onPress={handleSignIn}
          disabled={!isFormValid}
        >
          <Text style={[
            styles.signInButtonText,
            !isFormValid && styles.signInButtonTextDisabled
          ]}>
            Sign In
          </Text>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderForgotPasswordScreen = () => (
    <>
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
        <TouchableOpacity 
          style={[
            styles.signInButton, 
            !isForgotFormValid && styles.signInButtonDisabled
          ]} 
          onPress={handleSendResetLink}
          disabled={!isForgotFormValid}
        >
          <Text style={[
            styles.signInButtonText,
            !isForgotFormValid && styles.signInButtonTextDisabled
          ]}>
            Send Reset Link
          </Text>
        </TouchableOpacity>

        {/* Back to Login Link */}
        <TouchableOpacity onPress={handleBackToLogin}>
          <Text style={styles.forgotPasswordText}>Remember your password? Log in</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderResetPasswordScreen = () => (
    <>
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
              <View style={styles.eyeIconContainer}>
                {showNewPassword ? (
                  <View style={styles.eyeWrapper}>
                    <View style={styles.eyeOutline} />
                    <View style={styles.eyeDot} />
                    <View style={styles.slashLine} />
                  </View>
                ) : (
                  <View style={styles.eyeWrapper}>
                    <View style={styles.eyeOutline} />
                    <View style={styles.eyeDot} />
                  </View>
                )}
              </View>
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
              <View style={styles.eyeIconContainer}>
                {showConfirmPassword ? (
                  <View style={styles.eyeWrapper}>
                    <View style={styles.eyeOutline} />
                    <View style={styles.eyeDot} />
                    <View style={styles.slashLine} />
                  </View>
                ) : (
                  <View style={styles.eyeWrapper}>
                    <View style={styles.eyeOutline} />
                    <View style={styles.eyeDot} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Password Button */}
        <TouchableOpacity 
          style={[
            styles.signInButton, 
            !isResetFormValid && styles.signInButtonDisabled
          ]} 
          onPress={handleResetPassword}
          disabled={!isResetFormValid}
        >
          <Text style={[
            styles.signInButtonText,
            !isResetFormValid && styles.signInButtonTextDisabled
          ]}>
            Reset Password
          </Text>
        </TouchableOpacity>

        {/* Back to Login Link */}
        <TouchableOpacity onPress={handleBackToLogin}>
          <Text style={styles.forgotPasswordText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </>
  );

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
              <View style={styles.logo}>
                <Text style={styles.logoText}>📋</Text>
              </View>
              <Text style={styles.appName}>SnapTracker</Text>
            </View>
          </View>

          {currentScreen === 'login' && renderLoginScreen()}
          {currentScreen === 'forgot' && renderForgotPasswordScreen()}
          {currentScreen === 'reset' && renderResetPasswordScreen()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    paddingBottom: 40,
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
  },
  eyeIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeWrapper: {
    position: 'relative',
    width: 18,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeOutline: {
    width: 18,
    height: 12,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  eyeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    position: 'absolute',
  },
  slashLine: {
    position: 'absolute',
    width: 20,
    height: 1.5,
    backgroundColor: '#9CA3AF',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  signInButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
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
  },
});
