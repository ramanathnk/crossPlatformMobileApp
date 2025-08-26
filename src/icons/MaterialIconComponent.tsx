import React from 'react';
import { View, StyleSheet } from 'react-native';

export interface MaterialIconImageProps {
  Icon: React.FC<{ width?: number; height?: number; fill?: string }>;
  size?: number;
  color?: string;
}

const MaterialIconImage: React.FC<MaterialIconImageProps> = ({
  Icon,
  size = 48,
  color = '#9CA3AF',
}) => (
  <View style={[styles.icon, { width: size, height: size }]}>
    <Icon width={size} height={size} fill={color} />
  </View>
);

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MaterialIconImage;