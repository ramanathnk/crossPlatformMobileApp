import CrossPlatformAlert from './CrossPlatformAlert';
import { Platform } from 'react-native';

describe('CrossPlatformAlert', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('calls window.alert and the onPress for single button on web', () => {
    // Force Platform.OS to 'web'
    Object.defineProperty(Platform, 'OS', { value: 'web' });

    const onPress = jest.fn();
    // Provide window.alert mock
    window.alert = jest.fn();

    CrossPlatformAlert.alert('Title', 'message', [{ text: 'OK', onPress }]);

    expect(window.alert).toHaveBeenCalledWith('Title\n\nmessage');
    expect(onPress).toHaveBeenCalled();
  });

  it('uses window.confirm for multiple buttons and calls correct handler (confirmed)', () => {
    Object.defineProperty(Platform, 'OS', { value: 'web' });

    const firstOnPress = jest.fn();
    const secondOnPress = jest.fn();

    // Simulate user clicking "confirm" (true)
    window.confirm = jest.fn().mockReturnValue(true);

    CrossPlatformAlert.alert('Title', 'msg', [
      { text: 'No', onPress: firstOnPress },
      { text: 'Yes', onPress: secondOnPress },
    ]);

    expect(window.confirm).toHaveBeenCalled();
    expect(secondOnPress).toHaveBeenCalled();
    expect(firstOnPress).not.toHaveBeenCalled();
  });

  it('uses window.confirm for multiple buttons and calls first handler when not confirmed', () => {
    Object.defineProperty(Platform, 'OS', { value: 'web' });

    const firstOnPress = jest.fn();
    const secondOnPress = jest.fn();

    // Simulate user clicking "cancel" (false)
    window.confirm = jest.fn().mockReturnValue(false);

    CrossPlatformAlert.alert('Title', 'msg', [
      { text: 'No', onPress: firstOnPress },
      { text: 'Yes', onPress: secondOnPress },
    ]);

    expect(window.confirm).toHaveBeenCalled();
    expect(firstOnPress).toHaveBeenCalled();
    expect(secondOnPress).not.toHaveBeenCalled();
  });
});
