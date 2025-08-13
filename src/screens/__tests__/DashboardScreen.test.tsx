import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import DashboardScreen from '../DashboardScreen';

describe('DashboardScreen', () => {
  it('renders the dashboard title', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DashboardScreen />
      </NavigationContainer>
    );
    expect(getByText('Dashboard')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const { toJSON } = render(
      <NavigationContainer>
        <DashboardScreen />
      </NavigationContainer>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});