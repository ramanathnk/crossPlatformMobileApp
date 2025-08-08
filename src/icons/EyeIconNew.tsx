import React from 'react';
import { View, StyleSheet } from 'react-native';

// Import SVGs as React components
import Visibility from '../../assets/material-icons/visibility.svg';
import VisibilityOff from '../../assets/material-icons/visibility_off.svg';

export interface EyeIconProps {
  visible: boolean;
  size?: number;
  color?: string;
}

const EyeIconNew: React.FC<EyeIconProps> = ({
  visible,
  size = 20,
  color = '#9CA3AF',
}) => {
  const IconComponent = visible ? Visibility : VisibilityOff;
  return (
    <View style={[styles.icon, { width: size, height: size }]}>
      <IconComponent width={size} height={size} fill={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EyeIconNew;