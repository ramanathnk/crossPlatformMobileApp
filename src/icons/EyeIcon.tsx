import React from 'react';
import Feather from 'react-native-vector-icons/Feather';

export interface EyeIconProps {
  visible: boolean;
  size?: number;
  color?: string;
}

const EyeIcon: React.FC<EyeIconProps> = ({
  visible,
  size = 20,
  color = '#9CA3AF',
}) => (
  <Feather name={visible ? 'eye' : 'eye-off'} size={size} color={color} />
);

export default EyeIcon;