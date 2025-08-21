import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import RequestsScreen from '../screens/RequestsScreen';
import RecordsScreen from '../screens/RecordsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MaterialIconComponent from '../icons/MaterialIconComponent';
import HomeIcon from '../../assets/material-icons/home.svg';
import ConciergeIcon from '../../assets/material-icons/concierge.svg';
import TableEditIcon from '../../assets/material-icons/table_edit.svg';
import SettingsIcon from '../../assets/material-icons/settings.svg';
import DeviceRequestsScreen from '../screens/DeviceRequestsScreen';

export type AppTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Records: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppTabs: React.FC = () => {
  const insets = useSafeAreaInsets(); // <-- Add this line

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#374151',
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          color: '#9CA3AF',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          const iconColor = focused ? '#3B82F6' : '#9CA3AF';
          switch (route.name) {
            case 'Dashboard':
              IconComponent = HomeIcon;
              break;
            case 'Requests':
              IconComponent = ConciergeIcon;
              break;
            case 'Records':
              IconComponent = TableEditIcon;
              break;
            case 'Settings':
              IconComponent = SettingsIcon;
              break;
            default:
              IconComponent = HomeIcon;
          }
          return <MaterialIconComponent Icon={IconComponent} size={24} color={iconColor} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Requests" component={DeviceRequestsScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AppTabs;
