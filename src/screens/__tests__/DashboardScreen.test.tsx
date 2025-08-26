import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import DashboardScreen from '../DashboardScreen';
import { renderWithProviders } from '../../test-utils';

// Mock useNavigation so we can assert navigation calls
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
    }),
  };
});

// Adjusted mock paths: tests live in src/screens/__tests__, components/icons are in src/icons
jest.mock('../../icons/SnapTrackerLogo', () => () => null);
jest.mock('../../icons/MaterialIconComponent', () => () => null);
jest.mock('../../assets/material-icons/table_edit.svg', () => '');
jest.mock('../../assets/material-icons/add_box.svg', () => '');
jest.mock('../../assets/material-icons/mobile_check.svg', () => '');
jest.mock('../../assets/material-icons/concierge.svg', () => '');
jest.mock('../../assets/material-icons/pending_actions.svg', () => '');

describe('DashboardScreen', () => {
  afterEach(() => {
    mockNavigate.mockClear();
  });

  it('renders core UI elements', () => {
    const { getByText } = renderWithProviders(<DashboardScreen />);

    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Device Registration Portal')).toBeTruthy();
    expect(getByText('CORE MODULES')).toBeTruthy();
    // A stat label shows up
    expect(getByText('Pending Requests')).toBeTruthy();
  });

  it('navigates to the correct screens when module cards are pressed', () => {
    const { getByText } = renderWithProviders(<DashboardScreen />);

    fireEvent.press(getByText('Device Requests'));
    expect(mockNavigate).toHaveBeenCalledWith('DeviceRequests');

    fireEvent.press(getByText('Register Device'));
    expect(mockNavigate).toHaveBeenCalledWith('RegisterDevice');

    fireEvent.press(getByText('Manage Records'));
    expect(mockNavigate).toHaveBeenCalledWith('RecordsScreen');

    fireEvent.press(getByText('View Devices'));
    expect(mockNavigate).toHaveBeenCalledWith('Devices');
  });
});
