import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import RegisterDeviceScreen from '../RegisterDeviceScreen';
import { renderWithProviders } from '../../test-utils';

// --- Mocks for Redux slices / thunks and utilities ---
// Mock deviceRequestsSlice: registerDeviceRequest + selectors used by the component
jest.mock('../../store/deviceRequestsSlice', () => {
  return {
    registerDeviceRequest: jest.fn((data) => ({ type: 'REGISTER_DEVICE', meta: { data } })),
    selectRegistering: (s: any) => false,
    selectRegisterError: (s: any) => null,
  };
});

// Mock dealerSlice
jest.mock('../../store/dealerSlice', () => {
  return {
    fetchDealers: jest.fn(),
    selectDealers: (s: any) => [
      { dealerId: 1, name: 'Dealer One' },
      { dealerId: 2, name: 'Dealer Two' },
    ],
    selectDealersLoading: (s: any) => false,
    selectDealersError: (s: any) => null,
  };
});

// Mock deviceTypeSlice
jest.mock('../../store/deviceTypeSlice', () => {
  return {
    fetchDeviceTypes: jest.fn(),
    selectDeviceTypes: (s: any) => [{ deviceTypeId: 10, modelNumber: 'Model X' }],
    selectDeviceTypesLoading: (s: any) => false,
    selectDeviceTypesError: (s: any) => null,
  };
});

// Mock CrossPlatformDropdownGen (adjusted path: ../../components from test file)
jest.mock('../../components/CrossPlatformDropdownGen', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => {
    const placeholder = props.placeholder || 'dropdown';
    return React.createElement(
      TouchableOpacity,
      {
        testID: `dropdown-${placeholder.replace(/\s+/g, '-').toLowerCase()}`,
        onPress: () => {
          const first = props.options && props.options.length > 0 ? props.options[0].value : null;
          if (props.multiSelect) {
            props.onSelect(first != null ? [first] : []);
          } else {
            props.onSelect(first);
          }
        },
      },
      React.createElement(Text, null, placeholder),
    );
  };
});

// Mock CrossPlatformAlert (adjusted path: ../../utils)
jest.mock('../../utils/CrossPlatformAlert', () => ({
  alert: jest.fn(),
}));

// Mock react-native-paper Provider to just render children (so we don't depend on native paper behavior)
jest.mock('react-native-paper', () => {
  const React = require('react');
  return {
    Provider: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

// Ensure any svg/icon imports (if present) do not break tests
jest.mock('../../icons/SnapTrackerLogo', () => () => null);

describe('RegisterDeviceScreen', () => {
  it('disables Register button when form is invalid and enables when valid', async () => {
    const { getByTestId, getByPlaceholderText, getByText } = renderWithProviders(
      <RegisterDeviceScreen />,
    );

    const registerBtn = getByTestId('register-device-button');
    // Initially disabled because no dealer selected and serial number not valid
    expect(registerBtn).toBeDisabled();

    // Select dealer (our mocked dropdown will call onSelect with first option)
    fireEvent.press(getByText('Select dealers'));

    // Enter invalid serial (too short)
    const serialInput = getByPlaceholderText('Enter device serial number');
    fireEvent.changeText(serialInput, 'abc123');

    // Select device type
    fireEvent.press(getByText('Select device type'));

    // Status has a default selected value in component (1), so if dealer selected and device type selected
    // serial is still invalid -> button should remain disabled
    expect(registerBtn).toBeDisabled();

    // Enter a valid serial (10 alphanumeric characters). The component uppercases and strips non-alphanum.
    fireEvent.changeText(serialInput, 'abc-123-def4'); // becomes ABC123DEF4 which is 10 chars

    // Now the button should be enabled
    await waitFor(() => {
      expect(getByTestId('register-device-button')).not.toHaveProp('disabled', true);
    });
  });

  it('dispatches registerDeviceRequest and shows results alert on successful registration', async () => {
    const { getByTestId, getByPlaceholderText, getByText, store } = renderWithProviders(
      <RegisterDeviceScreen />,
    );

    // Mock store.dispatch to return an object with unwrap() that resolves to a successful response
    (store.dispatch as jest.Mock).mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          serialNo: 'ABC123DEF4',
          dealerResults: [{ dealerId: 1, success: true }],
        }),
    }));

    // Select dealer and device type using our mocked dropdowns
    fireEvent.press(getByText('Select dealers'));
    fireEvent.press(getByText('Select device type'));

    // Enter a valid serial
    const serialInput = getByPlaceholderText('Enter device serial number');
    fireEvent.changeText(serialInput, 'abc123def4'); // normalized to uppercase, etc.

    // Press Register
    const registerBtn = getByTestId('register-device-button');
    fireEvent.press(registerBtn);

    // Wait for dispatch to be called and for CrossPlatformAlert.alert to be triggered
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalled();
    });

    const CrossPlatformAlert = require('../../utils/CrossPlatformAlert');
    await waitFor(() => {
      expect(CrossPlatformAlert.alert).toHaveBeenCalled();
      // First argument is the title 'Registration Results'
      expect(CrossPlatformAlert.alert.mock.calls[0][0]).toMatch(/Registration Results/);
    });
  });
});
