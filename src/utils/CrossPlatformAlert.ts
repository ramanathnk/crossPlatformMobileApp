import { Platform, Alert as RNAlert } from 'react-native';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
}

class CrossPlatformAlert {
  static alert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) {
    if (Platform.OS === 'web') {
      const fullMessage = message ? `${title}\n\n${message}` : title;

      if (buttons && buttons.length > 1) {
        // Use confirm for multiple buttons
        const confirmed = window.confirm(fullMessage);
        if (confirmed && buttons[1]?.onPress) {
          buttons[1].onPress();
        } else if (!confirmed && buttons[0]?.onPress) {
          buttons[0].onPress();
        }
      } else {
        // Use alert for single button
        window.alert(fullMessage);
        if (buttons?.[0]?.onPress) {
          buttons[0].onPress();
        }
      }
    } else {
      // Use React Native Alert for mobile platforms
      RNAlert.alert(title, message, buttons as any, options);
    }
  }
}

export default CrossPlatformAlert;
