import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import LoginScreen from '../LoginScreen';
import { renderWithProviders } from '../../test-utils';
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore so tests don't touch native storage
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
}));

describe('LoginScreen', () => {
  const baseState = {
    auth: {
      loading: false,
      error: null,
      user: null,
    },
  };

  it('disables Sign In initially', () => {
    const { getByTestId } = renderWithProviders(<LoginScreen />, { preloadedState: baseState });
    expect(getByTestId('sign-in-button')).toBeDisabled();
  });

  it('enables Sign In when both fields are filled', async () => {
    const { getByTestId } = renderWithProviders(<LoginScreen />, { preloadedState: baseState });

    fireEvent.changeText(getByTestId('username-input'), 'user1');
    fireEvent.changeText(getByTestId('password-input'), 'pass1');

    await waitFor(() => {
      const btn = getByTestId('sign-in-button');
      expect(btn.props.accessibilityState?.disabled).toBeFalsy();
    });
  });

  it('toggles password visibility when eye icon pressed', async () => {
    const { getByTestId } = renderWithProviders(<LoginScreen />, { preloadedState: baseState });

    // initially secureTextEntry should be true
    expect(getByTestId('password-input').props.secureTextEntry).toBe(true);

    fireEvent.press(getByTestId('toggle-password-visibility'));

    await waitFor(() => {
      expect(getByTestId('password-input').props.secureTextEntry).toBe(false);
    });
  });

  it('dispatches login thunk and stores token on successful login', async () => {
    const { getByTestId, store } = renderWithProviders(<LoginScreen />, {
      preloadedState: baseState,
    });

    // Make dispatch return an object with unwrap() that resolves to a token (matches component usage)
    (store.dispatch as jest.Mock).mockImplementation(() => ({
      unwrap: () => Promise.resolve({ accessToken: 'token-123' }),
    }));

    fireEvent.changeText(getByTestId('username-input'), 'user1');
    fireEvent.changeText(getByTestId('password-input'), 'pass1');

    fireEvent.press(getByTestId('sign-in-button'));

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalled();
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', 'token-123');
    });
  });
});
