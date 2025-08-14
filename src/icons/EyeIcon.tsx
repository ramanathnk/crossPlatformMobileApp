import React from 'react';
import MaterialIconImage from '../icons/MaterialIconComponent';
import Visibility from '../../assets/material-icons/visibility.svg';
import VisibilityOff from '../../assets/material-icons/visibility_off.svg';

interface EyeIconProps {
  visible: boolean;
  size?: number;
  color?: string;
}

const EyeIcon: React.FC<EyeIconProps> = ({ visible, size = 24, color = '#374151' }) => (
  <MaterialIconImage
    Icon={visible ? Visibility : VisibilityOff}
    size={size}
    color={color}
  />
);

export default EyeIcon;