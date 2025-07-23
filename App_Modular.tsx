import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import DashboardScreen from './src/screens/DashboardScreen';

export type ScreenType = 'login' | 'forgot' | 'reset' | 'dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen 
            onSignInSuccess={() => setCurrentScreen('dashboard')}
            onForgotPassword={() => setCurrentScreen('forgot')}
          />
        );
      
      case 'forgot':
        return (
          <ForgotPasswordScreen 
            onBackToLogin={() => setCurrentScreen('login')}
            onNavigateToReset={() => setCurrentScreen('reset')}
          />
        );
      
      case 'reset':
        return (
          <ResetPasswordScreen 
            onBackToLogin={() => setCurrentScreen('login')}
            onResetSuccess={() => setCurrentScreen('login')}
          />
        );
      
      case 'dashboard':
        return (
          <DashboardScreen 
            onLogout={() => setCurrentScreen('login')}
          />
        );
      
      default:
        return (
          <LoginScreen 
            onSignInSuccess={() => setCurrentScreen('dashboard')}
            onForgotPassword={() => setCurrentScreen('forgot')}
          />
        );
    }
  };

  return (
    <>
      <StatusBar style="light" />
      {renderCurrentScreen()}
    </>
  );
}
