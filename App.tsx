import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RegisterDeviceScreen from './src/screens/RegisterDeviceScreen';



export type RootStackParamList = {
  Login: undefined;
  Forgot: undefined;
  Reset: { token?: string; email?: string } | undefined;
  Dashboard: undefined;
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
    <NavigationContainer linking={linking}>
      <StatusBar style="light" />
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
        <Stack.Screen name="Reset" component={ResetPasswordScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="RegisterDevice" component={RegisterDeviceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
