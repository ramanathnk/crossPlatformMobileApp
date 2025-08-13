import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import RegisterDeviceScreen from '../RegisterDeviceScreen';

describe('RegisterDeviceScreen', () => {
  const setup = () =>
    render(
      <NavigationContainer>
        <RegisterDeviceScreen />
      </NavigationContainer>
    );

  it('disables Register Device initially', () => {
    const { getByTestId } = setup();
    const btn = getByTestId("register-device-button");
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  // Add more tests here for valid form, snapshots, etc.
});