import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import RegisterDeviceScreen from './src/screens/RegisterDeviceScreen';
import AppTabs from './src/navigation/AppTabs';

export type RootStackParamList = {
  Login: undefined;
  Forgot: undefined;
  Reset: { token?: string; email?: string } | undefined;
  MainTabs: undefined;
  RegisterDevice: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['IMDRA://'],
  config: {
    screens: {
      Login: 'login',
      Forgot: 'forgot',
      Reset: {
        path: 'reset-password',
        parse: {
          token: (token: string) => token,
          email: (email: string) => email,
        },
      },
      Dashboard: 'dashboard',
      RegisterDevice: 'register-device',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <StatusBar style="light" />
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
          <Stack.Screen name="Reset" component={ResetPasswordScreen} />
          <Stack.Screen name="MainTabs" component={AppTabs} />
          <Stack.Screen name="RegisterDevice" component={RegisterDeviceScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}