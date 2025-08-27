/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import RegisterDeviceScreen from '../RegisterDeviceScreen';
import { renderWithProviders } from '../../test-utils';
import CrossPlatformAlert from '../../utils/CrossPlatformAlert';

// --- Mocks for Redux slices / thunks and utilities ---
// Keep jest.mock factories self-contained and do not reference out-of-scope variables
// (use require inside the factory) to avoid "module factory cannot reference out-of-scope variables".

jest.mock('../../store/deviceRequestsSlice', () => {
  return {
    registerDeviceRequest: jest.fn((data) => ({ type: 'REGISTER_DEVICE', meta: { data } })),
    selectRegistering: () => false,
    selectRegisterError: () => null,
  };
});

jest.mock('../../store/dealerSlice', () => {
  return {
    fetchDealers: jest.fn(),
    selectDealers: () => [
      { dealerId: 1, name: 'Dealer One' },
      { dealerId: 2, name: 'Dealer Two' },
    ],
    selectDealersLoading: () => false,
    selectDealersError: () => null,
  };
});

jest.mock('../../store/deviceTypeSlice', () => {
  return {
    fetchDeviceTypes: jest.fn(),
    selectDeviceTypes: () => [{ deviceTypeId: 10, modelNumber: 'Model X' }],
    selectDeviceTypesLoading: () => false,
    selectDeviceTypesError: () => null,
  };
});

// Mock CrossPlatformDropdownGen without referencing outer-scope variables.
// Use require inside factory so Jest does not complain about out-of-scope access.
jest.mock('../../components/CrossPlatformDropdownGen', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  // annotate props with any to satisfy TypeScript here (tests/mocks are allowed to be looser)
  return function MockDropdown(props: any) {
    const placeholder = props.placeholder || 'dropdown';
    return React.createElement(
      TouchableOpacity,
      {
        testID: `dropdown-${String(placeholder).replace(/\s+/g, '-').toLowerCase()}`,
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

// Mock CrossPlatformAlert as ES module default { alert: jest.fn() }
jest.mock('../../utils/CrossPlatformAlert', () => ({
  __esModule: true,
  default: { alert: jest.fn() },
}));

// Mock react-native-paper Provider using require inside factory (no external React reference)
// annotate children as any to satisfy TypeScript
jest.mock('react-native-paper', () => {
  const React = require('react');
  return {
    Provider: ({ children }: { children: any }) =>
      React.createElement(React.Fragment, null, children),
  };
});

// Prevent icon SVG from breaking tests
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

    await waitFor(() => {
      const alertModule = CrossPlatformAlert as unknown as { alert: jest.Mock };
      expect(alertModule.alert).toHaveBeenCalled();
      expect(alertModule.alert.mock.calls[0][0]).toMatch(/Registration Results/);
    });
  });
});
